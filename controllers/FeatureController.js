const Food = require("../models/Food");
const User = require("../models/User");
const stripe = require("stripe")(process.env.STRIPE_KEY);

// ADD TO CART ROUTE
const addToCart = async (req, res) => {
    const userId = req.params.id;
    const { id, name, price, rating, image, quantity } = req.body;

    try {
        // Check if the item already exists in the cart for the user
        let existingItem = await Food.findOne({ _id: id, userId: userId });

        if (existingItem) {
            // Update the quantity and total price of the existing item
            let updatedItem = await Food.findOneAndUpdate(
                { _id: id, userId: userId },
                {
                    $set: {
                        quantity: existingItem.quantity + 1,
                        totalPrice: (existingItem.price * (existingItem.quantity + 1)),
                    },
                },
                { new: true } // Return the updated document
            );

            if (!updatedItem) {
                return res.status(400).json({ success: false, message: "Failed to add to cart" });
            }

            return res.status(200).json({ success: true, message: "Added to cart", item: updatedItem });
        }

        // If item is not in the cart, create a new entry
        let newFood = new Food({
            _id: id,
            name,
            price,
            rating,
            image,
            quantity,
            userId,
            totalPrice: price * quantity,
        });

        const saveFood = await newFood.save();

        // Push the new food item to the user's cartItems
        let user = await User.findOneAndUpdate(
            { _id: userId },
            {
                $push: {
                    cartItems: saveFood._id, // Ensure this matches your schema
                },
            }
        );

        if (!user) {
            return res.status(400).json({ success: false, message: "Failed to add to cart" });
        }

        return res.status(200).json({ success: true, message: "Added to Cart", item: saveFood });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// GET CART ITEMS ROUTE
const getCart = async (req, res) => {
    const userId = req.params.id;

    try {
        // Find all the cart items for the given user
        const cartItems = await Food.find({ userId });

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        // Return the cart items
        return res.status(200).json({ success: true, cartItems });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// REMOVE FROM CART
const removeFromCart = async (req, res) => {
    const id = req.params.id;

    try {
        let food = await Food.findOneAndDelete({ _id: id });
        if (!food) {
            return res.status(400).json({ success: false, message: "Food item not found in cart" });
        }

        // Optionally, you might want to remove the food item from the user's cartItems array as well
        await User.updateMany(
            { cartItems: id },
            { $pull: { cartItems: id } }
        );

        return res.status(200).json({ success: true, message: "Food item removed from cart" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// INCREMENT ITEM QUANTITY IN CART
const incrementQuantity = async (req, res) => {
    const id = req.params.id;

    try {
        let food = await Food.findById(id);

        if (!food) {
            return res.status(400).json({ success: false, message: "Food item not found in cart" });
        }

        // Increment the quantity and update the totalPrice
        food = await Food.findByIdAndUpdate(
            id,
            {
                $inc: { quantity: 1 }, // Increment quantity by 1
                $set: {
                    totalPrice: (food.price * (food.quantity + 1)), // Recalculate totalPrice
                },
            },
            { new: true } // Return the updated document
        );

        if (!food) {
            return res.status(400).json({ success: false, message: "Failed to increment quantity" });
        }

        return res.status(200).json({ success: true, message: "Food quantity incremented", food });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// DECREMENT ITEM QUANTITY IN CART
const decrementQuantity = async (req, res) => {
    const id = req.params.id;

    try {
        // Find the food item by its ID
        let food = await Food.findById(id);

        if (!food) {
            return res.status(400).json({ success: false, message: "Food item not found" });
        }

        // Check if the quantity is greater than 1 before decrementing
        if (food.quantity <= 1) {
            return res.status(400).json({ success: false, message: "Quantity cannot be less than 1" });
        }

        // Decrement the quantity and update the totalPrice
        food = await Food.findByIdAndUpdate(
            id,
            {
                $inc: { quantity: -1 }, // Decrement quantity by 1
                $set: {
                    totalPrice: (food.price * (food.quantity - 1)), // Recalculate totalPrice
                },
            },
            { new: true } // Return the updated document
        );

        if (!food) {
            return res.status(400).json({ success: false, message: "Failed to decrement quantity" });
        }

        return res.status(200).json({ success: true, message: "Food quantity decremented", food });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// CHECKOUT ROUTE
const checkout = async (req, res) => {
    const userId = req.params.id;

    try {
        // Retrieve cart items for the user
        const cartItems = await Food.find({ userId });

        if (cartItems.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        // Create a Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: "payment",
            line_items: cartItems.map((item) => ({
                price_data: {
                    currency: "inr",
                    product_data: {
                        name: item.name,
                        images: [item.image], // Assuming you meant item.image here
                    },
                    unit_amount: item.price * 100, // Stripe expects the amount in cents
                },
                quantity: item.quantity,
            })),
            success_url: "http://localhost:5173/success",
            cancel_url: "http://localhost:5173/",
        });

        // Send the session URL to the client
        res.json({ url: session.url });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// clear cart route
const clearCart = async (req, res) => {
    const userId = req.id;
    try {
        const userItems = await Food.deleteMany({userId});
        const deletedList = await User.findOneAndUpdate(
            {_id:userId},{
                cartItems:[],
            });
            if(!deleteItems){
                return res.status(400).json({ success: false, message: "Failed to clear cart"});

            }
            return res.status(200).json({ success: true, message:"order confirmed"})
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });  
    }
    }

module.exports = { getCart, addToCart, removeFromCart, incrementQuantity, decrementQuantity, checkout,clearCart };
