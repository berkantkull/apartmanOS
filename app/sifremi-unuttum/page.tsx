import type { Metadata } from "next";
import PasswordRecovery from "../password-recovery";

export const metadata:Metadata={title:"Şifremi Unuttum",robots:{index:false,follow:false}};

export default async function ForgotPasswordPage({searchParams}:{searchParams:Promise<{token?:string}>}){const query=await searchParams;return <PasswordRecovery token={String(query.token||"").slice(0,128)}/>}
