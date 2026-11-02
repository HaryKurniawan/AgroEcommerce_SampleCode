import React from "react";
import { Store } from "lucide-react";

import type { ApiCartItem } from "@/types";

import CartItemRow from "./CartItemRow";

interface CartStoreGroupProps {
  tokoId: string;
  storeName: string;
  items: ApiCartItem[];
  isSelectMode: boolean;
  selectedIds: string[];
  onToggleStore: () => void;
  onToggleItem: (id: string) => void;
  onUpdateQuantity: (
    id: string,
    deltaOrTarget: number,
    isAbsolute?: boolean,
  ) => void;
  onUpdateVariant: (id: string, newVarianId: string) => void;
  onPromptDelete: (item: import("@/types").ApiCartItem) => void;
}

const CartStoreGroup: React.FC<CartStoreGroupProps> = ({
  storeName,
  items,
  isSelectMode,
  selectedIds,
  onToggleStore,
  onToggleItem,
  onUpdateQuantity,
  onUpdateVariant,
  onPromptDelete,
}) => {
  const itemIds = items.map((i) => i.id_itemKeranjang);
  const isStoreSelected = itemIds.every((id) => selectedIds.includes(id));

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-visible mb-6 shadow-sm">
      {/* Store Header */}
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-gray-100 bg-gray-50/20 rounded-t-2xl">
        <div className="flex items-center gap-4">
          {isSelectMode && (
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={isStoreSelected}
                onChange={onToggleStore}
                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 transition-all cursor-pointer"
              />
            </div>
          )}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
              <Store size={14} className="text-gray-400" />
            </div>
            <div>
              <span className="font-display font-semibold text-sm text-gray-900">
                {storeName}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="divide-y divide-gray-100">
        {items.map((item) => (
          <CartItemRow
            key={item.id_itemKeranjang}
            item={item}
            isSelectMode={isSelectMode}
            isSelected={selectedIds.includes(item.id_itemKeranjang)}
            onToggleSelection={() => onToggleItem(item.id_itemKeranjang)}
            onUpdateQuantity={(deltaOrTarget, isAbsolute) =>
              onUpdateQuantity(item.id_itemKeranjang, deltaOrTarget, isAbsolute)
            }
            onUpdateVariant={(newVarianId) =>
              onUpdateVariant(item.id_itemKeranjang, newVarianId)
            }
            onPromptDelete={() => onPromptDelete(item)}
          />
        ))}
      </div>
    </div>
  );
};

export default CartStoreGroup;
