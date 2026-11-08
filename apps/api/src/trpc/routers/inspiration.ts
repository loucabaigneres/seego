import { TRPCError } from '@trpc/server';
import { and, desc, eq, inArray } from 'drizzle-orm';
import * as z from 'zod';
import { upsertImportedPlace } from '../../lib/importedPlaces.js';
import { analyzeUrl } from '../../lib/inspiration/analyze.js';
import { CAPTION_UNAVAILABLE, requireSupportedPlatform } from '../../lib/inspiration/errors.js';
import { asPlaces, asTags, summariseLocation } from '../../lib/inspiration/places.js';
import { addPlacesToLikedDay, type PlaceWithRef } from '../../lib/inspiration/tripPlaces.js';
import {
  extractHashtags,
  fetchCaption,
  normalizeContentUrl,
  stripHashtags,
} from '../../lib/socialImport/index.js';
import { importedInspiration, trip } from '../../lib/tables.js';
import { createTRPCRouter, protectedProcedure } from '../init.js';

const importUrlInput = z.object({
  url: z.url("L'URL n'est pas valide."),
  // Légende collée à la main quand la récupération automatique échoue.
  caption: z.string().max(5000).optional(),
});

export const inspirationRouter = createTRPCRouter({
  importFromUrl: protectedProcedure.input(importUrlInput).mutation(async ({ ctx, input }) => {
    const platform = requireSupportedPlatform(input.url);

    let caption = input.caption?.trim();

    if (!caption) {
      const result = await fetchCaption(input.url);

      if (!result.ok) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: CAPTION_UNAVAILABLE });
      }

      caption = result.caption;
    }

    const tags = extractHashtags(caption);

    const [inspiration] = await ctx.db
      .insert(importedInspiration)
      .values({
        userId: ctx.user.id,
        platform,
        originalUrl: input.url,
        // Les hashtags vivent dans `extracted_tags` : on ne les garde pas dans la description.
        description: stripHashtags(caption) || null,
        // La localisation sera déduite plus tard (géocodage / IA) : la colonne est
        // NOT NULL sans valeur par défaut, on laisse une chaîne vide en attendant.
        extracted_location: '',
        extracted_tags: tags,
        status: tags.length > 0 ? 'analyzed' : 'failed',
      })
      .returning();

    return {
      success: true,
      inspiration: {
        id: inspiration.id,
        platform: inspiration.platform,
        originalUrl: inspiration.originalUrl,
        description: inspiration.description,
        tags,
      },
    };
  }),

  /**
   * Analyse par IA (Google Gemini) : on récupère la légende + l'image d'aperçu de la
   * publication, on les soumet au modèle, et on stocke le compte rendu produit ainsi
   * que les lieux détectés (avec leur adresse quand elle est connue).
   */
  analyzeFromUrl: protectedProcedure.input(importUrlInput).mutation(async ({ ctx, input }) => {
    const platform = requireSupportedPlatform(input.url);

    // Dédup au niveau de la vidéo : si l'utilisateur a déjà analysé ce lien, on renvoie
    // l'analyse existante sans refaire d'appel IA ni créer un doublon.
    const normalizedUrl = normalizeContentUrl(input.url);
    const mine = await ctx.db
      .select({
        id: importedInspiration.id,
        platform: importedInspiration.platform,
        originalUrl: importedInspiration.originalUrl,
        description: importedInspiration.description,
        aiReport: importedInspiration.aiReport,
        type: importedInspiration.type,
        city: importedInspiration.city,
        extractedPlaces: importedInspiration.extractedPlaces,
        tags: importedInspiration.extracted_tags,
      })
      .from(importedInspiration)
      .where(eq(importedInspiration.userId, ctx.user.id));

    const existing = mine.find((row) => normalizeContentUrl(row.originalUrl) === normalizedUrl);
    if (existing) {
      return {
        success: true,
        alreadyImported: true,
        inspiration: {
          id: existing.id,
          platform: existing.platform,
          originalUrl: existing.originalUrl,
          description: existing.description,
          aiReport: existing.aiReport,
          type: existing.type,
          city: existing.city,
          extractedPlaces: asPlaces(existing.extractedPlaces),
          tags: asTags(existing.tags),
        },
      };
    }

    const { analysis, caption, tags, previewImageUrl } = await analyzeUrl(input.url, input.caption);

    // Chaque lieu détecté devient un « élément lieu » réutilisable (dédupliqué), que
    // l'on pourra sélectionner plus tard dans le remplacement d'activités. Séquentiel :
    // l'upsert géocode l'adresse (OpenStreetMap), qui tolère mal les requêtes en rafale.
    for (const place of analysis.places) {
      await upsertImportedPlace(ctx.db, ctx.user.id, place, previewImageUrl);
    }

    const [inspiration] = await ctx.db
      .insert(importedInspiration)
      .values({
        userId: ctx.user.id,
        platform,
        originalUrl: input.url,
        description: caption ? stripHashtags(caption) || null : null,
        extracted_location: summariseLocation(analysis.places),
        extracted_tags: tags,
        aiReport: analysis.summary || null,
        type: analysis.type,
        city: analysis.city,
        extractedPlaces: analysis.places,
        status: 'analyzed',
      })
      .returning();

    return {
      success: true,
      alreadyImported: false,
      inspiration: {
        id: inspiration.id,
        platform: inspiration.platform,
        originalUrl: inspiration.originalUrl,
        description: inspiration.description,
        aiReport: inspiration.aiReport,
        type: inspiration.type,
        city: inspiration.city,
        extractedPlaces: analysis.places,
        tags,
      },
    };
  }),

  /**
   * Ajoute les lieux des inspirations sélectionnées au bucket « lieux likés » (jour 0)
   * d'un voyage de l'utilisateur. Une activité est créée par lieu extrait ; elles sont
   * ensuite prises en compte par la génération de l'itinéraire.
   */
  addToTrip: protectedProcedure
    .input(
      z.object({
        tripId: z.uuid(),
        inspirationIds: z.array(z.uuid()).min(1, 'Sélectionne au moins un post.'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Périmètre à l'utilisateur : on ne touche qu'un voyage et des inspirations à lui.
      const [tripRow] = await ctx.db
        .select({ id: trip.id })
        .from(trip)
        .where(and(eq(trip.id, input.tripId), eq(trip.userId, ctx.user.id)));

      if (!tripRow) {
        throw new TRPCError({ code: 'NOT_FOUND', message: "Ce voyage n'existe pas." });
      }

      const inspirations = await ctx.db
        .select({ extractedPlaces: importedInspiration.extractedPlaces })
        .from(importedInspiration)
        .where(
          and(
            eq(importedInspiration.userId, ctx.user.id),
            inArray(importedInspiration.id, input.inspirationIds),
          ),
        );

      const places = inspirations.flatMap((row) => asPlaces(row.extractedPlaces));

      if (places.length === 0) {
        return { success: true, tripId: input.tripId, added: 0 };
      }

      // On rattache chaque lieu à son « élément lieu » (créé/dédupliqué), pour que les
      // activités partagent la même identité (et les mêmes coordonnées) que les candidats
      // du remplacement. Séquentiel à cause du géocodage éventuel (OpenStreetMap).
      const placesWithRef: PlaceWithRef[] = [];
      for (const place of places) {
        placesWithRef.push({ place, ref: await upsertImportedPlace(ctx.db, ctx.user.id, place) });
      }

      const added = await addPlacesToLikedDay(ctx.db, input.tripId, placesWithRef);

      return { success: true, tripId: input.tripId, added };
    }),

  listMine: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({
        id: importedInspiration.id,
        platform: importedInspiration.platform,
        originalUrl: importedInspiration.originalUrl,
        description: importedInspiration.description,
        aiReport: importedInspiration.aiReport,
        type: importedInspiration.type,
        city: importedInspiration.city,
        extractedPlaces: importedInspiration.extractedPlaces,
        tags: importedInspiration.extracted_tags,
        status: importedInspiration.status,
        createdAt: importedInspiration.createdAt,
      })
      .from(importedInspiration)
      .where(eq(importedInspiration.userId, ctx.user.id))
      .orderBy(desc(importedInspiration.createdAt))
      .limit(100);

    return rows.map((row) => ({
      ...row,
      tags: asTags(row.tags),
      extractedPlaces: asPlaces(row.extractedPlaces),
    }));
  }),

  /** Supprime une publication analysée. Les lieux déjà ajoutés à des voyages sont conservés. */
  delete: protectedProcedure.input(z.object({ id: z.uuid() })).mutation(async ({ ctx, input }) => {
    const deleted = await ctx.db
      .delete(importedInspiration)
      .where(and(eq(importedInspiration.id, input.id), eq(importedInspiration.userId, ctx.user.id)))
      .returning({ id: importedInspiration.id });

    if (deleted.length === 0) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Publication introuvable.' });
    }

    return { success: true };
  }),
});
