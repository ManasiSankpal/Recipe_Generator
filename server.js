const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json({ limit: '10mb' })); // Increase limit for large images
app.use(bodyParser.urlencoded({ extended: true }));

const analyzeImage = async (imageData) => {
    try {
        const response = await axios.post('https://api.worqhat.com/api/ai/images/v2/image-analysis', {
            image: imageData
        }, {
            headers: {
                'Authorization': 'Bearer sk-b48c1b8d21744d309b64fcbb45f78d4e',
                'Content-Type': 'application/json'
            }
        });

        return response.data.ingredients;
    } catch (error) {
        console.error('Error analyzing image:', error.response ? error.response.data : error.message);
        throw new Error('Error analyzing image');
    }
};

app.post('/generate-recipe', async (req, res) => {
    const base64Images = req.body.images;

    try {
        let allIngredients = [];
        for (const base64Image of base64Images) {
            const ingredients = await analyzeImage(base64Image);
            allIngredients = allIngredients.concat(ingredients);
        }

        const uniqueIngredients = [...new Set(allIngredients)]; 
        const recipe = generateRecipe(uniqueIngredients);

        res.send(recipe);
    } catch (error) {
        console.error('Error generating recipe:', error.message);
        res.status(500).send('Error generating recipe');
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

function generateRecipe(ingredients) {
    let recipe = 'Here is a simple recipe based on the ingredients:\n\n';

    recipe += 'Ingredients:\n';
    ingredients.forEach(ingredient => {
        recipe += `- ${ingredient}\n`;
        
    });

    recipe += '\nInstructions:\n';
    recipe += '1. Prepare all your ingredients.\n';
    recipe += '2. Mix the ingredients together.\n';
    recipe += '3. Cook as required, depending on the type of dish.\n';
    recipe += '4. Serve and enjoy your meal!';

    return recipe;
}
