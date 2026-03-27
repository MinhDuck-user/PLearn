import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Thêm dòng này: giúp các file JS/CSS tìm thấy nhau bằng đường dẫn tương đối
  base: './', 
  build: {
    outDir: 'dist',
  }
})
