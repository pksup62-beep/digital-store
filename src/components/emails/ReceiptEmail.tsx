import * as React from 'react';
import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Link,
    Preview,
    Text,
    Section,
    Hr,
} from '@react-email/components';

interface ReceiptEmailProps {
    orderId: string;
    productName: string;
    amount: number;
    date: string;
    productUrl: string;
}

export default function ReceiptEmail({
    orderId,
    productName,
    amount,
    date,
    productUrl
}: ReceiptEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>Your receipt for {productName}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>Thank you for your purchase!</Heading>
                    <Text style={text}>
                        Hi there,
                    </Text>
                    <Text style={text}>
                        We have received your payment for <strong>{productName}</strong>.
                    </Text>

                    <Section style={box}>
                        <Text style={paragraph}><strong>Order ID:</strong> {orderId}</Text>
                        <Text style={paragraph}><strong>Date:</strong> {date}</Text>
                        <Text style={paragraph}><strong>Amount Paid:</strong> ₹{amount}</Text>
                    </Section>

                    <Hr style={hr} />

                    <Text style={text}>
                        You can access your content immediately by clicking the button below:
                    </Text>

                    <Section style={{ textAlign: 'center', margin: '32px 0' }}>
                        <Link href={productUrl} style={button}>
                            Access Content
                        </Link>
                    </Section>

                    <Text style={footer}>
                        If you have any questions, just reply to this email.
                    </Text>
                    <Text style={footer}>
                        Digital Store via Resend
                    </Text>
                </Container>
            </Body>
        </Html>
    );
}

const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px',
};

const h1 = {
    color: '#333',
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    margin: '30px 0',
};

const text = {
    color: '#333',
    fontSize: '16px',
    lineHeight: '26px',
    padding: '0 48px',
};

const box = {
    padding: '24px',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
    margin: '24px 48px',
};

const paragraph = {
    fontSize: '14px',
    lineHeight: '24px',
    margin: '0',
};

const hr = {
    borderColor: '#e6ebf1',
    margin: '20px 0',
};

const button = {
    backgroundColor: '#2563eb', // Blue-600
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '12px 32px',
    borderRadius: '8px',
};

const footer = {
    color: '#8898aa',
    fontSize: '12px',
    lineHeight: '16px',
    padding: '0 48px',
    marginTop: '16px',
};
