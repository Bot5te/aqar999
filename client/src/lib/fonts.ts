// Import fonts from Google CDN
export function importFonts() {
  // Add Cairo and Tajawal fonts from Google Fonts
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Tajawal:wght@400;500;700&display=swap';
  document.head.appendChild(link);
  
  // Add Font Awesome for icons
  const fontAwesome = document.createElement('link');
  fontAwesome.rel = 'stylesheet';
  fontAwesome.href = 'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@5.15.4/css/all.css';
  document.head.appendChild(fontAwesome);
  
  // Add custom styles for Arabic fonts
  const style = document.createElement('style');
  style.textContent = `
    :root {
      --font-sans: 'Cairo', sans-serif;
      --font-heading: 'Tajawal', sans-serif;
    }
    
    body {
      font-family: 'Cairo', sans-serif;
    }
    
    .font-heading {
      font-family: 'Tajawal', sans-serif;
    }
    
    h1, h2, h3, h4, h5, h6 {
      font-family: 'Tajawal', sans-serif;
    }
  `;
  document.head.appendChild(style);
}

// Call the function to import fonts
importFonts();
