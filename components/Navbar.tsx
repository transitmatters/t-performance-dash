// import React from 'react';
// import { Disclosure } from '@headlessui/react';
// import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
// import Image from 'next/image';
// import TmLogoSvg from '../public/tm-logo-big.svg';
// import { ActiveLink } from './utils/ActiveLink';

// const navBarLinks = {
//   line: 'Line Dashboards',
//   system: 'System-Wide Dashboards',
//   ourSelection: 'Our Selection',
//   personalized: 'Personalized Dashboard',
//   donate: 'Donate',
//   feedback: 'Feedback',
// };

// export const Navbar = () => {
//   return (
//     <>
//       <div className="sticky top-0 w-full">
//         <div className="bg-tm-grey shadow-sm">
//           <div className="mx-auto max-w-7xl sm:px-6 sm:px-8">
//             <div className="relative flex justify-between">
//               <div className="flex flex-1 items-center pl-1 sm:items-stretch sm:justify-start">
//                 <div className="flex flex-shrink-0 items-center">
//                   <Image
//                     className="block h-7 w-auto stroke-black sm:hidden"
//                     src={TmLogoSvg}
//                     alt="Your Company"
//                   />
//                   <Image
//                     className="hidden h-6 w-auto stroke-black sm:block"
//                     src={TmLogoSvg}
//                     alt="Your Company"
//                   />
//                 </div>
//                 <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
//                   {Object.entries(navBarLinks).map(([key, value]) => {
//                     return (
//                       <ActiveLink key={key} href={`/${key}`} activeClassName="border-white">
//                         <a className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-white">
//                           {value}
//                         </a>
//                       </ActiveLink>
//                     );
//                   })}
//                 </div>
//               </div>
//               <div className="flex items-center justify-between sm:hidden">
//                 {/* Mobile menu button */}
//                 <Disclosure.Button className="inline-flex items-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
//                   <span className="sr-only">Open main menu</span>
//                   {open ? (
//                     <XMarkIcon className="block h-7 w-7" aria-hidden="true" color="white" />
//                   ) : (
//                     <Bars3Icon className="block h-7 w-7" aria-hidden="true" color="white" />
//                   )}
//                 </Disclosure.Button>
//               </div>
//             </div>
//           </div>

//           <div className="sm:hidden">
//             <div className="space-y-1 pt-2 pb-4">
//               {Object.entries(navBarLinks).map(([key, value]) => {
//                 return (
//                   <ActiveLink key={key} href={`/${key}`} activeClassName="border-white">
//                     <a className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-white">
//                       {value}
//                     </a>
//                   </ActiveLink>
//                 );
//               })}
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };
