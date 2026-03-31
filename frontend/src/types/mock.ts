export type MockEndpoint = {
    id: string;
    user_id: string;
    path: string;
    method: string;
    status: number;
    response_body: string;
    created_at: string;
    expires_at: string;
    hit_count?: number;
    curl_command?: string;
};
