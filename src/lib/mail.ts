import { Resend } from 'resend';
import ReceiptEmail from '@/components/emails/ReceiptEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendReceiptEmail({
    email,
    orderId,
    productName,
    amount,
    date,
    productUrl
}: {
    email: string;
    orderId: string;
    productName: string;
    amount: number;
    date: string;
    productUrl: string;
}) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is missing. Email not sent.');
        return;
    }

    try {
        await resend.emails.send({
            from: 'Digital Store <onboarding@resend.dev>', // Free tier Requirement
            to: email,
            subject: `Receipt for your order: ${orderId}`,
            react: ReceiptEmail({
                orderId,
                productName,
                amount,
                date,
                productUrl
            })
        });
        console.log(`Email sent to ${email}`);
    } catch (error) {
        console.error('Failed to send email:', error);
    }
}
