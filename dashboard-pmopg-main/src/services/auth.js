// Mock implementations for auth since new API doesn't require authentication
export const loginUser = async (username, password) => {
    console.log('Login mock:', { username });
    // Return mock user data for development
    return {
        data: {
            accessToken: 'mock-token-' + Date.now(),
            user: { 
                id: 1, 
                email: username, 
                name: 'Mock User',
                userType: 0 
            }
        }
    };
}

export const getUserData = async () => {
    console.log('getUserData mock called');
    return {
        data: {
            id: 1,
            email: 'user@example.com',
            name: 'Mock User',
            accessToken: 'mock-token-' + Date.now(),
            userType: 0
        }
    };
}

export const changePass = async (oldPass, newPass) => {
    console.log('Password change mock:', { oldPass: '***', newPass: '***' });
    return { 
        data: { 
            success: true,
            message: 'Password changed successfully'
        } 
    };
}