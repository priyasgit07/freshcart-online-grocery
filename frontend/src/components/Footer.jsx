import React from 'react';
import { ShoppingBag, Truck, ShieldCheck, Clock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20">
      {/* Feature perks banner */}
      <div className="border-b border-slate-100 bg-emerald-50/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-4">
              <div className="p-3 bg-brand-100 text-brand-700 rounded-2xl">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">Cash on Delivery (COD)</h4>
                <p className="text-xs text-slate-500">Pay safely upon receipt of your grocery items</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start space-x-4">
              <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">100% Quality Guaranteed</h4>
                <p className="text-xs text-slate-500">Directly sourced from certified local vendors</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start space-x-4">
              <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">Real-Time Status Tracking</h4>
                <p className="text-xs text-slate-500">Instant in-app alerts from confirmation to delivery</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-brand-600" />
            <span className="font-bold text-sm text-slate-800">FreshCart Platform</span>
            <span>&copy; {new Date().getFullYear()} Online Grocery Ordering System. All rights reserved.</span>
          </div>
          <div className="flex space-x-6">
            <span className="hover:text-slate-800">Customer Support</span>
            <span className="hover:text-slate-800">Vendor Terms</span>
            <span className="hover:text-slate-800">Privacy Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
