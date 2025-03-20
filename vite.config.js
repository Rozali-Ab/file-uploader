export default {
  base: '/file-uploader/',
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'https://file-upload-server-mc26.onrender.com/api/v1/upload')
  }
} 