import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

// Type for recipe data
interface RecipeData {
    title: string;
    image_url?: string | null;
    description?: string | null;
    servings?: string | null;
    prep_time?: number | null;
    cook_time?: number | null;
    ingredients?: { name: string; quantity: string; unit?: string }[] | string[];
    instructions?: { step: string; description: string }[] | string[];
    category?: string | null;
    isMyRecipe?: boolean;
}

/**
 * Generate HTML content for the PDF based on recipe data
 */
const generateRecipeHTML = (recipe: RecipeData): string => {
    // Format time (convert minutes to hours and minutes if needed)
    const formatTime = (minutes: number | null | undefined): string => {
        if (!minutes) return 'N/A';
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0
            ? `${hours} hr ${remainingMinutes} min`
            : `${hours} hr`;
    };

    // Format ingredients list based on data structure
    const formatIngredients = () => {
        if (!recipe.ingredients || recipe.ingredients.length === 0) {
            return '<p>No ingredients listed</p>';
        }

        let ingredientsHTML = '';
        recipe.ingredients.forEach((item) => {
            if (typeof item === 'string') {
                ingredientsHTML += `<li>${item}</li>`;
            } else {
                const quantity = item.quantity || '';
                const unit = item.unit || '';
                const name = item.name || '';
                ingredientsHTML += `<li>${quantity} ${unit} ${name}</li>`;
            }
        });
        return `<ul>${ingredientsHTML}</ul>`;
    };

    // Format instructions list based on data structure
    const formatInstructions = () => {
        if (!recipe.instructions || recipe.instructions.length === 0) {
            return '<p>No instructions listed</p>';
        }

        let instructionsHTML = '';
        recipe.instructions.forEach((item, index) => {
            if (typeof item === 'string') {
                instructionsHTML += `<li><strong>Step ${index + 1}:</strong> ${item}</li>`;
            } else {
                instructionsHTML += `<li><strong>Step ${index + 1}:</strong> ${item.description}</li>`;
            }
        });
        return `<ol>${instructionsHTML}</ol>`;
    };

    // Main HTML template
    return `
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .recipe-header {
          text-align: center;
          margin-bottom: 30px;
        }
        .recipe-title {
          font-size: 24px;
          font-weight: bold;
          color: #3B82F6;
          margin-bottom: 10px;
        }
        .recipe-meta {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin: 15px 0;
          font-size: 14px;
          color: #666;
        }
        .recipe-image {
          text-align: center;
          margin: 20px 0;
        }
        .recipe-image img {
          max-width: 100%;
          border-radius: 8px;
          max-height: 300px;
        }
        .recipe-description {
          font-style: italic;
          margin-bottom: 20px;
          text-align: center;
        }
        .section {
          margin: 25px 0;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          color: #3B82F6;
          border-bottom: 2px solid #3B82F6;
          padding-bottom: 5px;
          margin-bottom: 15px;
        }
        ul, ol {
          padding-left: 20px;
        }
        li {
          margin-bottom: 8px;
        }
        .recipe-footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #888;
          border-top: 1px solid #ddd;
          padding-top: 15px;
        }
      </style>
    </head>
    <body>
      <div class="recipe-header">
        <div class="recipe-title">${recipe.title}</div>
        ${recipe.category ? `<div class="recipe-category">Category: ${recipe.category}</div>` : ''}
        
        <div class="recipe-meta">
          <span>Prep Time: ${formatTime(recipe.prep_time)}</span>
          <span>Cook Time: ${formatTime(recipe.cook_time)}</span>
          <span>Servings: ${recipe.servings || 'N/A'}</span>
        </div>
        
        ${recipe.description
            ? `<div class="recipe-description">${recipe.description}</div>`
            : ''}
      </div>
      
      ${recipe.image_url
            ? `<div class="recipe-image">
            <img src="${recipe.image_url}" alt="${recipe.title}" />
           </div>`
            : ''}
      
      <div class="section">
        <div class="section-title">Ingredients</div>
        ${formatIngredients()}
      </div>
      
      <div class="section">
        <div class="section-title">Instructions</div>
        ${formatInstructions()}
      </div>
      
      <div class="recipe-footer">
        Generated with Let Him Cook App
        ${new Date().toLocaleDateString()}
      </div>
    </body>
    </html>
  `;
};

/**
 * Generate and share a recipe as PDF
 */
export const shareRecipeAsPDF = async (recipe: RecipeData): Promise<void> => {
    try {
        // Generate HTML content
        const htmlContent = generateRecipeHTML(recipe);

        // Check if sharing is available
        if (!(await Sharing.isAvailableAsync())) {
            throw new Error('Sharing is not available on this device');
        }

        // Generate the PDF using expo-print
        const { uri } = await Print.printToFileAsync({
            html: htmlContent,
            base64: false,
        });

        // Share the PDF
        await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: `${recipe.title} Recipe`,
            UTI: 'com.adobe.pdf', // iOS UTI
        });

        // Clean up temp file (optional)
        try {
            // Expo generally handles cleanup, but we can explicitly delete if needed
            // await FileSystem.deleteAsync(uri, { idempotent: true });
        } catch (cleanupError) {
            console.log('Error cleaning up temporary file:', cleanupError);
        }
    } catch (error) {
        console.error('Error generating or sharing PDF:', error);
        throw error;
    }
};
