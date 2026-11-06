// Font files are bundled by Metro and handed to expo-font as an asset id.
declare module '*.ttf' {
  const asset: number;
  export default asset;
}
