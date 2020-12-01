function buildPath(route)
{
	if (process.env.NODE_ENV === 'production') 
	{
		return 'https://brownie-points-4331-6.herokuapp.com/api/' + route;
	}
	else
	{        
		return 'http://localhost:5000/api/' + route;
	}
}

export default buildPath;
