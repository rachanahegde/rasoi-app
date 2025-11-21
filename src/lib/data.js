export const INITIAL_RECIPES = [
    {
        id: '1',
        title: 'Lemon Herb Salmon Salad',
        description: 'A fresh and healthy salad with grilled salmon, perfect for summer lunch.',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
        time: '45 min',
        difficulty: 'Easy',
        calories: '320 kcal',
        tags: ['Healthy', 'Fish', 'Gluten-Free'],
        ingredients: ['2 Salmon fillets', '1 Lemon', 'Fresh Dill', 'Mixed Lettuce', 'Cherry Tomatoes', 'Cucumber'],
        steps: ['Season salmon with lemon and herbs.', 'Grill for 4-5 minutes per side.', 'Chop vegetables and mix in a bowl.', 'Top with salmon and serve.'],
        favorite: true,
        createdAt: Date.now() - 100000
    },
    {
        id: '2',
        title: 'Rustic Chocolate Pie',
        description: 'Rich, creamy chocolate pie with a flaky crust.',
        image: 'https://images.unsplash.com/photo-1690763641995-b4df616fa601?q=80&w=1011&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        time: '60 min',
        difficulty: 'Medium',
        calories: '450 kcal',
        tags: ['Dessert', 'Baking', 'Comfort'],
        ingredients: ['200g Dark Chocolate', '150g Butter', '3 Eggs', '100g Sugar', 'Pie Crust'],
        steps: ['Preheat oven to 180°C.', 'Melt chocolate and butter.', 'Whisk eggs and sugar, then fold in chocolate.', 'Pour into crust and bake for 25 mins.'],
        favorite: false,
        createdAt: Date.now()
    }
];
