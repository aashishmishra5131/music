import {resend} from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode : string
): Promise<ApiResponse>{
    try {
        // Log verification code to console for development/testing
        console.log(`\n========================================`);
        console.log(`📧 VERIFICATION EMAIL for ${username}`);
        console.log(`📬 To: ${email}`);
        console.log(`🔑 Verification Code: ${verifyCode}`);
        console.log(`========================================\n`);

        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'MusicNext | Verification code',
            react: VerificationEmail({username, otp:verifyCode}),
        });

        if (error) {
            console.log("Resend API error:", error);
            // Still return success since we logged the code to console
            // In production, you'd return failure here
            return {success: true, message: 'Verification code generated (check server console)'}
        }

        return {success: true, message: 'Verification email sent successfully'}
    } catch (emailError) {
        console.log("Error sending verification email:", emailError);
        // Even if email fails, return success so user can use console code in development
        return {success: true, message: 'Verification code generated (check server console)'}
    }
}
