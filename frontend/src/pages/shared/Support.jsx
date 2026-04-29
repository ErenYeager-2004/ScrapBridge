import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { 
  HelpCircle, 
  Mail, 
  Phone, 
  FileQuestion, 
  ArrowRight,
  ClipboardList,
  MapPin,
  CheckSquare,
  Search,
  ShoppingCart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Support() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const faqs = {
    HOME_USER: [
      {
        q: "How do I schedule a pickup?",
        a: "Navigate to your Dashboard or click the 'New Request' button. Fill in the details of the scrap materials, your address, and submit. An admin will quote a price, which you can accept to get a collector assigned."
      },
      {
        q: "What materials do you accept?",
        a: "We currently accept paper, cardboard, plastics, metals (iron, aluminium, copper), e-waste, and glass. Ensure materials are clean and separated for the best price."
      },
      {
        q: "How is pricing calculated?",
        a: "Pricing is based on current market rates and the condition/weight of the materials you provide. The admin will offer a final quote based on your submitted photos and descriptions."
      },
      {
        q: "Where is my receipt?",
        a: "Once a collector picks up your scrap and marks it as collected, the admin will complete the request. You can then download your official PDF receipt from the 'My Requests' detail page."
      },
      {
        q: "Can I cancel a request?",
        a: "Yes, you can reject a quote if you're not satisfied, which will cancel the request. If you need to cancel after accepting, please contact support."
      }
    ],
    COLLECTOR: [
      {
        q: "How do I mark a pickup as collected?",
        a: "Go to your 'Assigned Pickups' page, click 'View Detail' on the specific job, and use the 'Mark as Collected' button once you have the materials."
      },
      {
        q: "What if the customer is not home?",
        a: "Try contacting the customer via the provided phone number. If they are unreachable, notify the admin team so they can reschedule or cancel the pickup."
      },
      {
        q: "How do I report a damaged item?",
        a: "If the items differ significantly from the description, make a note and inform the admin. Do not mark as collected until the discrepancy is resolved."
      },
      {
        q: "Can I reschedule a pickup?",
        a: "Collectors cannot reschedule directly. Please contact the admin team to coordinate a new time with the user."
      }
    ],
    BUYER: [
      {
        q: "How do I place an order?",
        a: "Go to 'Browse Inventory', select the materials you need, specify the quantity, and confirm the order. An admin will process it."
      },
      {
        q: "What is the unit (per Kg) pricing?",
        a: "Prices are listed per Kilogram (Kg) on the inventory page. The total cost is calculated automatically when you enter the quantity."
      },
      {
        q: "When will my order be confirmed?",
        a: "Orders are typically reviewed and confirmed by our admins within 24 hours. You will receive a notification once confirmed."
      },
      {
        q: "How do I track delivery?",
        a: "You can track the status of your orders in the 'My Orders' section. Statuses include Placed, Confirmed, Delivered, or Cancelled."
      },
      {
        q: "What payment methods are accepted?",
        a: "Currently, payment is handled offline upon delivery or pickup. Please coordinate with the admin for specific arrangements."
      }
    ]
  };

  const roleFaqs = faqs[user?.role] || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Help & Support
        </h1>
        <p className="text-slate-500 dark:text-gray-400 mt-2">
          Find answers to common questions and get in touch with our team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - FAQs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-green-50 dark:bg-green-900/30 rounded-2xl text-green-600 dark:text-green-400">
                <FileQuestion size={24} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {roleFaqs.map((faq, index) => (
                <div key={index} className="p-5 bg-slate-50 dark:bg-gray-900/50 rounded-2xl border border-slate-100 dark:border-gray-700">
                  <h3 className="font-semibold text-slate-800 dark:text-gray-200 mb-2">
                    {faq.q}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          {/* How It Works (Home User Only) */}
          {user?.role === 'HOME_USER' && (
            <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                How It Works
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { step: 1, title: 'Submit', desc: 'Add items & photos' },
                  { step: 2, title: 'Get Quote', desc: 'Review admin offer' },
                  { step: 3, title: 'Schedule', desc: 'Confirm pickup date' },
                  { step: 4, title: 'Collect', desc: 'Hand over scrap' }
                ].map((item) => (
                  <div key={item.step} className="text-center">
                    <div className="w-10 h-10 mx-auto bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 font-bold rounded-full flex items-center justify-center mb-3">
                      {item.step}
                    </div>
                    <h4 className="font-semibold text-sm text-slate-800 dark:text-gray-200">{item.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Contact & Quick Links */}
        <div className="space-y-6">
          {/* Contact Card */}
          <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Contact Us</h3>
            
            {user?.role === 'COLLECTOR' ? (
              <div className="text-sm text-slate-600 dark:text-gray-400 space-y-4">
                <p>Need immediate assistance with a pickup or routing issue?</p>
                <div className="p-4 bg-slate-50 dark:bg-gray-900 rounded-xl">
                  <p className="font-medium text-slate-800 dark:text-gray-200 mb-1">Reach out to your admin team.</p>
                  <a href="mailto:admin@scrapbridge.com" className="text-green-600 dark:text-green-400 hover:underline flex items-center gap-2 mt-2">
                    <Mail size={16} />
                    admin@scrapbridge.com
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <a href="mailto:support@scrapbridge.com" className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors group">
                  <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">
                    <Mail size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-800 dark:text-gray-200">Email Support</div>
                    <div className="text-xs text-slate-500 dark:text-gray-400">support@scrapbridge.com</div>
                  </div>
                </a>
                
                <a href="tel:+919876543210" className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors group">
                  <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">
                    <Phone size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-800 dark:text-gray-200">Phone Support</div>
                    <div className="text-xs text-slate-500 dark:text-gray-400">+91 98765 43210</div>
                  </div>
                </a>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Quick Links</h3>
            <div className="space-y-2">
              {user?.role === 'HOME_USER' && (
                <>
                  <button onClick={() => navigate('/user/new-request')} className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-gray-900/50 hover:bg-green-50 dark:hover:bg-green-900/20 text-slate-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 rounded-xl transition-colors group">
                    <div className="flex items-center gap-3">
                      <HelpCircle size={18} />
                      <span className="font-medium text-sm">New Request</span>
                    </div>
                    <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                  <button onClick={() => navigate('/user/requests')} className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-gray-900/50 hover:bg-green-50 dark:hover:bg-green-900/20 text-slate-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 rounded-xl transition-colors group">
                    <div className="flex items-center gap-3">
                      <ClipboardList size={18} />
                      <span className="font-medium text-sm">My Requests</span>
                    </div>
                    <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </>
              )}
              
              {user?.role === 'COLLECTOR' && (
                <>
                  <button onClick={() => navigate('/collector/pickups')} className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-gray-900/50 hover:bg-green-50 dark:hover:bg-green-900/20 text-slate-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 rounded-xl transition-colors group">
                    <div className="flex items-center gap-3">
                      <MapPin size={18} />
                      <span className="font-medium text-sm">Assigned Pickups</span>
                    </div>
                    <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                  <button onClick={() => navigate('/collector/history')} className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-gray-900/50 hover:bg-green-50 dark:hover:bg-green-900/20 text-slate-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 rounded-xl transition-colors group">
                    <div className="flex items-center gap-3">
                      <CheckSquare size={18} />
                      <span className="font-medium text-sm">History</span>
                    </div>
                    <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </>
              )}
              
              {user?.role === 'BUYER' && (
                <>
                  <button onClick={() => navigate('/buyer/inventory')} className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-gray-900/50 hover:bg-green-50 dark:hover:bg-green-900/20 text-slate-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 rounded-xl transition-colors group">
                    <div className="flex items-center gap-3">
                      <Search size={18} />
                      <span className="font-medium text-sm">Browse Inventory</span>
                    </div>
                    <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                  <button onClick={() => navigate('/buyer/orders')} className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-gray-900/50 hover:bg-green-50 dark:hover:bg-green-900/20 text-slate-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 rounded-xl transition-colors group">
                    <div className="flex items-center gap-3">
                      <ShoppingCart size={18} />
                      <span className="font-medium text-sm">My Orders</span>
                    </div>
                    <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
