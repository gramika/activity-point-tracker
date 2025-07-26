const Message = ({ variant = 'info', children }) => {
    const getVariantClasses = () => {
      switch (variant) {
        case 'success':
          return 'bg-green-100 text-green-800 border-green-300';
        case 'error':
          return 'bg-red-100 text-red-800 border-red-300';
        case 'warning':
          return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        default:
          return 'bg-blue-100 text-blue-800 border-blue-300';
      }
    };
  
    return (
      <div className={`border p-3 rounded ${getVariantClasses()}`}>
        {children}
      </div>
    );
  };
  
  export default Message;