import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Row, Col, Alert, Navbar, DropdownButton, Dropdown, Nav, Modal, ListGroup, Badge } from 'react-bootstrap';
import { FaSearch, FaFilter, FaCheckCircle, FaUtensils, FaCalendarAlt, FaTrash, FaShoppingCart } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_KEY = '028ec61570b74d2aa23952d2910f74a2'; // Spoonacular API key

function App() {
  const [query, setQuery] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('calories');
  const [category, setCategory] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [error, setError] = useState('');
  const [mealPlan, setMealPlan] = useState([]);
  const [showMealPlanModal, setShowMealPlanModal] = useState(false);
  const [maxCalories, setMaxCalories] = useState('');
  const [maxTime, setMaxTime] = useState('');

  // Fetch recipes from Spoonacular API
  const fetchRecipes = async (query, category, cuisine) => {
    try {
      const response = await fetch(
        `https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&query=${query}&type=${category}&cuisine=${cuisine}&addRecipeNutrition=true`
      );
      if (!response.ok) throw new Error('Failed to fetch recipes');
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error fetching recipes:', error);
      return [];
    }
  };

  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    setError('');

    const results = await fetchRecipes(query, category, cuisine);
    if (results.length === 0) {
      setError('No recipes found. Try a different keyword.');
    } else {
      setRecipes(sortRecipes(results));
    }
    setLoading(false);
  };

  // Sorting function
  const sortRecipes = (recipes) => {
    if (sortBy === 'calories') {
      return recipes.sort((a, b) => {
        const aCalories = a.nutrition?.nutrients?.find(nutrient => nutrient.name === 'Calories')?.amount || 0;
        const bCalories = b.nutrition?.nutrients?.find(nutrient => nutrient.name === 'Calories')?.amount || 0;
        return aCalories - bCalories;
      });
    } else if (sortBy === 'prepTime') {
      return recipes.sort((a, b) => a.readyInMinutes - b.readyInMinutes);
    }
    return recipes;
  };

  // Add recipe to meal plan
  const addToMealPlan = (recipe) => {
    const updatedMealPlan = [...mealPlan, recipe];
    setMealPlan(updatedMealPlan);
    localStorage.setItem('mealPlan', JSON.stringify(updatedMealPlan)); // Save to localStorage
  };

  // Remove recipe from meal plan
  const removeFromMealPlan = (index) => {
    const updatedMealPlan = mealPlan.filter((_, i) => i !== index);
    setMealPlan(updatedMealPlan);
    localStorage.setItem('mealPlan', JSON.stringify(updatedMealPlan)); // Update localStorage
  };

  // Generate shopping list
  const generateShoppingList = () => {
    const ingredients = new Set();
    mealPlan.forEach(recipe => {
      recipe.extendedIngredients?.forEach(ingredient => {
        ingredients.add(ingredient.original);
      });
    });
    return Array.from(ingredients);
  };

  // Load meal plan from localStorage on initial render
  useEffect(() => {
    const savedMealPlan = JSON.parse(localStorage.getItem('mealPlan')) || [];
    setMealPlan(savedMealPlan);
  }, []);

  // Filter recipes by calories and preparation time
  const filteredRecipes = recipes.filter(recipe => {
    const calories = recipe.nutrition?.nutrients?.find(nutrient => nutrient.name === 'Calories')?.amount || 0;
    const time = recipe.readyInMinutes || 0;
    return (
      (!maxCalories || calories <= maxCalories) &&
      (!maxTime || time <= maxTime)
    );
  });

  return (
    <div>
      {/* Navbar */}
      <Navbar bg="success" variant="light" expand="lg" sticky="top">
        <Container>
          {/* Logo and App Name */}
          <Navbar.Brand href="#">
            <img
              src="/spo.jpeg" // Path to your logo in the public folder
              alt="Recipe App Logo"
              width="40"
              height="40"
              className="d-inline-block align-top me-2 rounded" // Added rounded for a circular look (optional)
              style={{ objectFit: 'cover' }} // Ensures the image fits within the square
            />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              {/* Categories Dropdown */}
              <DropdownButton
                align="end"
                variant="success"
                title={`Categories ${category ? `: ${category}` : ''}`}
                className="my-2"
              >
                <Dropdown.Item onClick={() => setCategory('')}>All Categories</Dropdown.Item>
                <Dropdown.Item onClick={() => setCategory('main course')}>Main Course</Dropdown.Item>
                <Dropdown.Item onClick={() => setCategory('dessert')}>Dessert</Dropdown.Item>
                <Dropdown.Item onClick={() => setCategory('appetizer')}>Appetizer</Dropdown.Item>
                <Dropdown.Item onClick={() => setCategory('salad')}>Salad</Dropdown.Item>
                <Dropdown.Item onClick={() => setCategory('side dish')}>Side Dish</Dropdown.Item>
              </DropdownButton>

              {/* Cuisine Dropdown */}
              <DropdownButton
                align="end"
                variant="success"
                title={<><FaUtensils /> Cuisine {cuisine ? `: ${cuisine}` : ''}</>}
                className="my-2"
              >
                <Dropdown.Item onClick={() => setCuisine('')}>All Cuisines</Dropdown.Item>
                <Dropdown.Item onClick={() => setCuisine('Italian')}>Italian</Dropdown.Item>
                <Dropdown.Item onClick={() => setCuisine('Mexican')}>Mexican</Dropdown.Item>
                <Dropdown.Item onClick={() => setCuisine('Asian')}>Asian</Dropdown.Item>
                <Dropdown.Item onClick={() => setCuisine('Indian')}>Indian</Dropdown.Item>
                <Dropdown.Item onClick={() => setCuisine('French')}>French</Dropdown.Item>
              </DropdownButton>
            </Nav>

            {/* Meal Plan Button with Badge */}
            <Button variant="success" onClick={() => setShowMealPlanModal(true)} className="mx-2 position-relative">
              <FaCalendarAlt /> Meal Plan
              {mealPlan.length > 0 && (
                <Badge pill bg="danger" className="position-absolute top-0 start-100 translate-middle">
                  {mealPlan.length}
                </Badge>
              )}
            </Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main Content */}
      <Container>
        <h1 className="my-4 text-center">Recipe Search</h1>

        {/* Error Message */}
        {error && <Alert variant="danger">{error}</Alert>}

        {/* Search Form */}
        <Form onSubmit={handleSearch} className="mb-4">
          <Form.Group controlId="recipeSearch" className="d-flex">
            <Form.Control
              type="text"
              placeholder="Search for a recipe..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="mr-2"
            />
            <Button variant="success" type="submit" disabled={loading}>
              {loading ? 'Loading...' : <FaSearch />}
            </Button>
          </Form.Group>
        </Form>

        {/* Filters for Calories and Time */}
        <Row className="mb-4">
          <Col md={6}>
            <Form.Group controlId="calorieFilter">
              <Form.Label>Max Calories</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter max calories"
                value={maxCalories}
                onChange={(e) => setMaxCalories(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="timeFilter">
              <Form.Label>Max Preparation Time (minutes)</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter max time"
                value={maxTime}
                onChange={(e) => setMaxTime(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Display Recipes */}
        <Row>
          {filteredRecipes.map((recipe) => (
            <Col sm={12} md={6} lg={4} key={recipe.id} className="mb-4">
              <Card className="border-success rounded-lg shadow-sm">
                <Card.Img variant="top" src={recipe.image} className="rounded-top" />
                <Card.Body>
                  <Card.Title>{recipe.title}</Card.Title>
                  <Card.Text>
                    <strong>Calories: </strong>
                    {recipe.nutrition?.nutrients?.find(nutrient => nutrient.name === 'Calories')?.amount || 'N/A'} kcal<br />
                    <strong>Preparation Time: </strong>{recipe.readyInMinutes} minutes<br />
                    <strong>Macronutrients: </strong>
                    Carbs: {recipe.nutrition?.nutrients?.find(nutrient => nutrient.name === 'Carbohydrates')?.amount || 'N/A'}g,
                    Protein: {recipe.nutrition?.nutrients?.find(nutrient => nutrient.name === 'Protein')?.amount || 'N/A'}g,
                    Fat: {recipe.nutrition?.nutrients?.find(nutrient => nutrient.name === 'Fat')?.amount || 'N/A'}g
                  </Card.Text>
                  <Button variant="success" href={`https://spoonacular.com/recipes/${recipe.title}-${recipe.id}`} target="_blank" className="w-100 mb-2">
                    View Recipe
                  </Button>
                  <Button variant="outline-success" onClick={() => addToMealPlan(recipe)} className="w-100">
                    Add to Meal Plan
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Meal Plan Modal */}
      <Modal show={showMealPlanModal} onHide={() => setShowMealPlanModal(false)} size="lg">
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>
            <FaCalendarAlt className="me-2" /> Meal Plan
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Meal Plan Recipes */}
          <h5 className="mb-3">Your Meal Plan</h5>
          <ListGroup>
            {mealPlan.map((recipe, index) => (
              <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>{recipe.title}</strong>
                  <div className="text-muted">
                    {recipe.readyInMinutes} mins | {recipe.nutrition?.nutrients?.find(nutrient => nutrient.name === 'Calories')?.amount || 'N/A'} kcal
                  </div>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => removeFromMealPlan(index)}
                  className="ms-2"
                >
                  <FaTrash />
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>

          {/* Shopping List */}
          <h5 className="mt-4 mb-3">
            <FaShoppingCart className="me-2" /> Shopping List
          </h5>
          <ListGroup>
            {generateShoppingList().map((item, index) => (
              <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                <span>{item}</span>
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(item)}
                >
                  Copy
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMealPlanModal(false)}>
            Close
          </Button>
          <Button variant="success" onClick={() => alert('Meal plan saved!')}>
            Save Plan
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default App;