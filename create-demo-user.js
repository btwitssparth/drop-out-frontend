// Simple demo user creation for testing
// Run this with: node create-demo-user.js

const createDemoUser = async () => {
  try {
    const response = await fetch('http://localhost:5002/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Demo Student',
        email: 'demo@student.com',
        password: 'Demo123!',
        role: 'student'
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Demo user created successfully!');
      console.log('Email: demo@student.com');
      console.log('Password: Demo123!');
      console.log('User ID:', data.userId);
    } else {
      console.log('❌ Error:', data.message);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
    console.log('Make sure backend is running on http://localhost:5002');
  }
};

createDemoUser();