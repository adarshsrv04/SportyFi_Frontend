
// import { Link, useNavigate } from 'react-router-dom';
// import { PlayCircle } from 'lucide-react';
// import { toast } from '@/hooks/use-toast';
// import { useAuth } from '@/context/AuthContext';

// export const navigationLinks = [
//   { title: 'Home', path: '/' },
//   { title: 'Matchess', path: '/matches' },
//   // { title: 'Tournaments', path: '/tournaments' },
//   { title: 'Watch Matches', path: '/watch', icon: <PlayCircle size={18} className="text-red-500" /> },
//   { title: 'Grounds Booking', path: '/venues' },
//   // { title: 'Leaderboards', path: '/leaderboards' },
//   { title: 'About', path: '/about' },
//   { title: 'Contact', path: '/contact' },
// ];

// interface NavigationLinksProps {
//   onClick?: () => void;
//   className?: string;
//   linkClassName?: string;
// }

// const NavigationLinks = ({ onClick, className = "", linkClassName = "" }: NavigationLinksProps) => {
//   const { user } = useAuth();
//   const navigate = useNavigate();

//   const checkAuth = (path: string) => {
//     if (!user) {
//       toast({
//         title: "Authentication required",
//         description: "Please log in to view matches",
//         variant: "destructive",
//       });
//       navigate('/auth');
//       return;
//     }
//     navigate(path);
//   }
//   return (
//     <nav className={className}>
//       {navigationLinks.map((link) => (
//         <Link
//           key={link.title}
//           to={link.path}
//           className={linkClassName}
//           onClick={onClick}
//         >
//           {link.icon &&
//            link.icon}
//           {link.title}
//           {link.title === 'Watch Matches' && (
//             <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">Live</span>
//           )}
//         </Link>
//       ))}
//     </nav>
//   );
// };

// export default NavigationLinks;


import { Link, useNavigate } from 'react-router-dom';
import { PlayCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

export const navigationLinks = [
  { title: 'Home', path: '/' },
  { title: 'Matches', path: '/matches' },
  { title: 'Watch Matches', path: '/watch', icon: <PlayCircle size={18} className="text-red-500" /> },
  { title: 'Grounds Booking', path: '/venues' },
  { title: 'About', path: '/about' },
  { title: 'Contact', path: '/contact' },
];

interface NavigationLinksProps {
  onClick?: () => void;
  className?: string;
  linkClassName?: string;
}

const NavigationLinks = ({ onClick, className = "", linkClassName = "" }: NavigationLinksProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const checkAuth = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (!user && path !== '/') {
      e.preventDefault(); // Prevent default link behavior
      toast({
        title: "Authentication required",
        description: "Please log in to access this page.",
        variant: "destructive",
      });
      navigate('/auth');
    } else if (user || path === '/') {
      // Let the Link handle navigation
      onClick?.();
    }
  };

  return (
    <nav className={className}>
      {navigationLinks.map((link) => (
        <Link
          key={link.title}
          to={link.path}
          className={linkClassName}
          onClick={(e) => checkAuth(e, link.path)}
        >
          {link.icon && link.icon}
          {link.title}
          {link.title === 'Watch Matches' && (
            <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full ml-1">Live</span>
          )}
        </Link>
      ))}
    </nav>
  );
};

export default NavigationLinks;
