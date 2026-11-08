import type { ReactNode } from 'react';
import { Card } from '../../common/components/card';
import { Container } from '../../common/components/container';

interface AuthCardProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthCard({
  eyebrow,
  title,
  description,
  children,
  footer,
}: Readonly<AuthCardProps>) {
  return (
    <Container className="py-10 sm:py-16" size="narrow">
      <Card className="mx-auto max-w-md">
        <p className="type-eyebrow text-primary">{eyebrow}</p>
        <h1 className="mt-2 type-heading text-foreground">{title}</h1>
        <p className="mt-2 text-muted-foreground">{description}</p>
        <div className="mt-6">{children}</div>
        <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
      </Card>
    </Container>
  );
}
