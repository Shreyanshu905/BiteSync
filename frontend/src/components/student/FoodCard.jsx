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
      className={`group bg-white rounded-xl border border-stone-200/75 overflow-hidden transition-colors duration-200 flex flex-col justify-between hover:border-stone-300 ${
        isSoldOut ? 'opacity-65' : ''
      }`}
    >
      <div>
        {/* Image Container */}
        <div className="relative h-40 w-full overflow-hidden bg-cream-100">
          <img
            src={
              dish.imageUrl ||
              'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80'
            }
            alt={dish.name}
            className={`w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] ${
              isSoldOut ? 'grayscale-[40%]' : ''
            }`}
            loading="lazy"
          />

          {/* Subtle Veg / Non-Veg Marker */}
          <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-xs p-1 rounded border border-stone-200/60">
            <div
              className={`w-3.5 h-3.5 border flex items-center justify-center rounded-[2px] ${
                dish.isVeg ? 'border-emerald-700' : 'border-red-700'
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  dish.isVeg ? 'bg-emerald-700' : 'bg-red-700'
                }`}
              ></div>
            </div>
          </div>

          {/* Quiet Rating Pill */}
          <div className="absolute top-2.5 right-2.5 bg-stone-900/75 backdrop-blur-xs text-white px-2 py-0.5 rounded-full text-[11px] font-medium flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-300 fill-amber-300" />
            <span className="tabular-nums">{dish.rating || 4.5}</span>
          </div>

          {/* Sold out / Low stock indicator */}
          {isSoldOut ? (
            <div className="absolute inset-0 bg-stone-900/45 backdrop-blur-[1px] flex items-center justify-center">
              <span className="bg-white/95 text-stone-800 font-medium text-[11px] uppercase tracking-wider px-3 py-1 rounded-full">
                Sold Out
              </span>
            </div>
          ) : isLowStock ? (
            <div className="absolute bottom-2.5 left-2.5 bg-white/95 text-brand-700 font-medium text-[11px] px-2 py-0.5 rounded-md border border-stone-200/60">
              {dish.stockQuantity} left
            </div>
          ) : null}
        </div>

        {/* Details */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-stone-900 text-sm leading-snug">
              {dish.name}
            </h3>
            <span className="text-sm font-semibold text-stone-900 shrink-0 tabular-nums">
              ₹{dish.price}
            </span>
          </div>

          <p className="text-xs text-stone-500 mt-1.5 line-clamp-2 leading-relaxed">
            {dish.description}
          </p>

          <div className="flex items-center gap-2 mt-3 text-[11px] text-stone-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {dish.preparationTimeMinutes || 12}m
            </span>
            <span>·</span>
            <span className="capitalize">{dish.category}</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-4 pb-4 pt-0.5">
        {isSoldOut ? (
          <button
            disabled
            className="w-full py-2 bg-stone-100 text-stone-400 font-medium text-xs rounded-lg cursor-not-allowed text-center"
          >
            Unavailable
          </button>
        ) : quantityInCart > 0 ? (
          <div className="flex items-center justify-between bg-cream-100/80 border border-stone-200 rounded-lg px-1.5 py-1">
            <button
              onClick={() => updateQuantity(dish._id, quantityInCart - 1)}
              className="w-7 h-7 bg-white text-stone-700 hover:bg-stone-900 hover:text-white rounded-md flex items-center justify-center border border-stone-200/70 transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="font-semibold text-xs text-stone-900 tabular-nums">
              {quantityInCart}
            </span>
            <button
              onClick={() => updateQuantity(dish._id, quantityInCart + 1)}
              className="w-7 h-7 bg-white text-stone-700 hover:bg-stone-900 hover:text-white rounded-md flex items-center justify-center border border-stone-200/70 transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => addToCart(dish, 1)}
            className="w-full py-2 bg-cream-50 hover:bg-stone-900 text-stone-800 hover:text-white border border-stone-200/90 hover:border-stone-900 font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        )}
      </div>
    </div>
  );
};

export default FoodCard;
