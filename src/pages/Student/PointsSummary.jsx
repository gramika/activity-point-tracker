const PointsSummary = ({ totalPoints, requiredPoints, certificates }) => {
    const progress = Math.min((totalPoints / requiredPoints) * 100, 100);
    
    // Group certificates by activity type
    const certificatesByType = certificates.reduce((acc, cert) => {
      if (!acc[cert.activityType]) {
        acc[cert.activityType] = [];
      }
      acc[cert.activityType].push(cert);
      return acc;
    }, {});
    
    // Calculate points by activity type
    const pointsByType = Object.keys(certificatesByType).map(type => {
      const certs = certificatesByType[type];
      const points = certs.reduce((sum, cert) => {
        if (cert.status !== 'rejected') {
          return sum + cert.pointsAwarded;
        }
        return sum;
      }, 0);
      
      return { type, points, count: certs.length };
    });
    
    // Calculate count by status
    const statusCounts = certificates.reduce(
      (acc, cert) => {
        acc[cert.status]++;
        return acc;
      },
      { pending: 0, approved: 0, rejected: 0 }
    );
    
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-4">Progress Summary</h2>
        
        <div className="mb-6">
          <div className="flex justify-between items-end mb-1">
            <p className="text-sm font-medium text-gray-700">Activity Points Progress</p>
            <p className="text-sm text-gray-700">
              {totalPoints} / {requiredPoints} points
            </p>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <p className="mt-1 text-sm text-gray-600">
            {progress >= 100 
              ? 'Congratulations! You have achieved the required points.' 
              : `${Math.round(progress)}% complete, ${requiredPoints - totalPoints} points remaining.`}
          </p>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Points by Activity Type</h3>
          <ul className="space-y-2">
            {pointsByType.map(({ type, points, count }) => (
              <li key={type} className="flex justify-between text-sm">
                <span className="text-gray-700">{type}</span>
                <span className="font-medium">
                  {points} pts ({count} certificates)
                </span>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">Certificates Status</h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-yellow-100 p-3 rounded-lg text-center">
              <span className="block text-2xl font-bold text-yellow-800">
                {statusCounts.pending}
              </span>
              <span className="text-sm text-yellow-800">Pending</span>
            </div>
            <div className="bg-green-100 p-3 rounded-lg text-center">
              <span className="block text-2xl font-bold text-green-800">
                {statusCounts.approved}
              </span>
              <span className="text-sm text-green-800">Approved</span>
            </div>
            <div className="bg-red-100 p-3 rounded-lg text-center">
              <span className="block text-2xl font-bold text-red-800">
                {statusCounts.rejected}
              </span>
              <span className="text-sm text-red-800">Rejected</span>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default PointsSummary;