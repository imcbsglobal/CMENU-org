import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { db } from '../components/Firebase';

const CategoryPage = () => {
  const { category } = useParams(); // Get the category ID from the URL parameters
  const [items, setItems] = useState([]); // State to hold items for the category

  useEffect(() => {
    // Reference to the items in the Firebase database based on the category
    const itemsRef = ref(db, `categories/${category}/items`);
    
    // Listen for value changes in the items reference
    const unsubscribe = onValue(itemsRef, (snapshot) => {
      const data = snapshot.val(); // Get the data from the snapshot
      if (data) {
        const itemList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setItems(itemList); // Set the items to state
      } else {
        setItems([]); // Clear items if no data found
      }
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, [category]);

  return (
    <div className="category-page">
      <h1>{category} Items</h1>
      <div>
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} className="item">
              <h2>{item.name}</h2>
              <p>Price: {item.price} <span>&#8377;</span></p>
              {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="item-image" />}
            </div>
          ))
        ) : (
          <p>No items found for this category.</p>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
