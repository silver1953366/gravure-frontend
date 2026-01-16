/** @type {import('tailwindcss').Config} */
module.exports = {
  // 1. CONTENT : Liste de tous les fichiers à scanner
  content: [
    "./src/**/*.{html,ts}", // Balaye tout le répertoire src
  ],
  
  // 2. THEME : Personnalisation de la palette de couleurs et des polices
  theme: {
    extend: {
      // Mappage des couleurs Tailwind sur vos variables CSS définies dans styles.css
      colors: {
        // Couleurs Primaires (Bleu Marine / Dark Blue)
        'primary-blue': 'var(--primary-blue)',
        'primary-blue-light': 'var(--primary-blue-light)',
        'primary-blue-dark': 'var(--primary-blue-dark)',
        
        // Couleur d'Accentuation (Jaune/Orange Vif)
        'accent-yellow': 'var(--accent-yellow)',
        'accent-yellow-dark': 'var(--accent-yellow-dark)',
        
        // Mappage pour les textes/fonds si vous souhaitez les utiliser dans Tailwind
        'gray-text': 'var(--gray-text)',
        'gray-sub': 'var(--gray-sub)',
      },
      
      // Mappage de la police de caractères
      fontFamily: {
         // Définit Poppins comme la police sans-serif par défaut
         sans: ['Poppins', 'sans-serif'],
      }
    },
  },
  
  // 3. PLUGINS : Ajout de plugins si nécessaire (laissé vide par défaut)
  plugins: [
    // Exemple : require('@tailwindcss/forms'),
  ],
}