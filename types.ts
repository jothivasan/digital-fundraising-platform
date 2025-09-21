export interface Profile {
    id: string;
    updated_at?: string;
    name: string;
    avatar_url?: string;
    role: string;
}

export interface Investment {
    user_id: string;
    // These fields are available if you select them in a join
    amount?: number;
    created_at?: string;
}

export interface Project {
    id: string;
    created_at: string;
    updated_at: string;
    title: string;
    tagline: string;
    description: string;
    category: string;
    image_url: string;
    funding_goal: number;
    current_funding: number;
    deadline: string;
    creator_id: string;
    // Joined data
    profiles: Profile | null;
    investments: Investment[];
}


export enum View {
    Landing = 'LANDING',
    Home = 'HOME',
    ProjectDetails = 'PROJECT_DETAILS',
    CreateProject = 'CREATE_PROJECT',
    Profile = 'PROFILE',
    Login = 'LOGIN',
    SignUp = 'SIGNUP',
    UserManagement = 'USER_MANAGEMENT',
    ForgotPassword = 'FORGOT_PASSWORD',
    ResetPassword = 'RESET_PASSWORD',
}