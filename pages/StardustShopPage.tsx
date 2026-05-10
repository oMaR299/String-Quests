/**
 * StardustShopPage — route wrapper for `/shop`.
 *
 * Mirrors the lightweight pattern used by HomePage / LearnPage: this page
 * mounts inside `AppShell` (declared in `App.tsx`), so the sidebar +
 * top-bar + bottom-nav are inherited automatically. We only render the
 * inner screen here.
 */

import React from 'react';
import { StardustShopScreen } from '../components/shop/StardustShopScreen';

const StardustShopPage: React.FC = () => {
  return (
    <div className="w-full">
      <StardustShopScreen />
    </div>
  );
};

export default StardustShopPage;
