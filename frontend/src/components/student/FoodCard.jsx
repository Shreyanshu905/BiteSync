import React from 'react';
import { Star, Plus, Minus, Clock } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const FoodCard = ({ dish }) => {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const cartItem = cartItems.find((item) => item.dish._id === dish._id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const isSoldOut = !dish.isAvailable || dish.stockQuantity <= 0;
  const isLowStock = dish.stockQuantity > 0 && dish.stockQuantity <= (dish.lowStockThreshold || 10);

  return (
    <div
      className={`group bg-white rounded-2xl border border-stone-100 shadow-soft overflow-hidden transition-all duration-200 flex flex-col justify-between hover:shadow-card hover:border-amber-200/60 ${
        isSoldOut ? 'opacity-70 grayscale-[20%]' : ''
      }`}
    >
      <div>
        {/* Dish Image Container */}
        <div className="relative h-44 w-full overflow-hidden bg-stone-100">
          <img
            src={
              dish.imageUrl ||
              'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80'
            }
            alt={dish.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          {/* Veg / Non-Veg Indicator Icon */}
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs p-1 rounded-md shadow-xs">
            <div
              className={`w-4 h-4 border-2 flex items-center justify-center rounded-[3px] ${
                dish.isVeg ? 'border-emerald-600' : 'border-red-600'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  dish.isVeg ? 'bg-emerald-600' : 'bg-red-600'
                }`}
              ></div>
            </div>
          </div>

          {/* Rating Badge */}
          <div className="absolute top-3 right-3 bg-stone-900/80 backdrop-blur-xs text-white px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>{dish.rating || 4.5}</span>
            <span className="text-[10px] text-stone-300">({dish.ratingCount || 10})</span>
          </div>

          {/* Sold out / Low stock badge */}
          {isSoldOut ? (
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-red-600 text-white font-bold text-xs uppercase px-3 py-1 rounded-full shadow-md">
                Sold Out
              </span>
            </div>
          ) : isLowStock ? (
            <div className="absolute bottom-2 left-2 bg-amber-500/95 text-white font-bold text-[11px] px-2.5 py-0.5 rounded-full shadow-xs">
              Only {dish.stockQuantity} left!
            </div>
          ) : null}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-stone-900 text-base group-hover:text-brand-600 transition-colors">
              {dish.name}
            </h3>
            <span className="text-base font-extrabold text-stone-900 shrink-0">
              ₹{dish.price}
            </span>
          </div>

          <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
            {dish.description}
          </p>

          <div className="flex items-center gap-3 mt-3 text-[11px] text-stone-400 font-medium">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              {dish.preparationTimeMinutes || 12} mins prep
            </span>
            <span>•</span>
            <span className="capitalize">{dish.category}</span>
          </div>
        </div>
      </div>

      {/* Action footer */}
      <div className="px-4 pb-4 pt-1">
        {isSoldOut ? (
          <button
            disabled
            className="w-full py-2 bg-stone-100 text-stone-400 font-semibold text-xs rounded-xl cursor-not-allowed text-center"
          >
            Currently Unavailable
          </button>
        ) : quantityInCart > 0 ? (
          <div className="flex items-center justify-between bg-brand-50 border border-brand-200 rounded-xl px-2 py-1 shadow-2xs">
            <button
              onClick={() => updateQuantity(dish._id, quantityInCart - 1)}
              className="w-7 h-7 bg-white text-brand-600 hover:bg-brand-500 hover:text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-2xs transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-bold text-sm text-brand-900">
              {quantityInCart}
            </span>
            <button
              onClick={() => updateQuantity(dish._id, quantityInCart + 1)}
              className="w-7 h-7 bg-white text-brand-600 hover:bg-brand-500 hover:text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => addToCart(dish, 1)}
            className="w-full py-2 bg-brand-500 hover:bg-brand-600 active:scale-[0.98] text-white font-semibold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add to Order
          </button>
        )}
      </div>
    </div>
  );
};

export default FoodCard;
