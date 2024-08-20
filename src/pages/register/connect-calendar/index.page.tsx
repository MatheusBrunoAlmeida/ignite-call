import { Button, Heading, MultiStep, Text } from "@ignite-ui/react";
import { Container, Header } from "../styles";
import { ArrowRight, Check } from "phosphor-react";
import { AuthError, ConnectBox, ConnectItem } from "./styles";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { NextSeo } from "next-seo";

export default function ConectCalendar() {

    const session = useSession()
    const router = useRouter()

    const hasAuthError = !!router.query.error
    const isSignedIn = session.status === 'authenticated'

    async function handleConnectCalendar() {
        await signIn('google')
    }

    async function handleNavigateToNextStep() {
        await router.push('/register/time-intervals')
    }

    return (
        <>
            <NextSeo
                title='Conecte sua agenda do google | Ignite Call'
                noindex
            />
            <Container>
                <Header>
                    <Heading as="strong">Conecte sua agenda!</Heading>
                    <Text>Conecte o seu calendário para verificar automaticamente as horas ocupadas e os novos eventos à medida em que são agendados.</Text>

                    <MultiStep size={4} currentStep={2} />
                </Header>

                <ConnectBox>
                    <ConnectItem>
                        <Text>Google Calendar</Text>
                        {isSignedIn ? (
                            <Button size="sm" disabled>
                                Conectado
                                <Check />
                            </Button>
                        ) : (
                            <Button variant="secondary" size="sm" onClick={handleConnectCalendar}>
                                Conectar
                                <ArrowRight />
                            </Button>
                        )}
                    </ConnectItem>

                    {hasAuthError && (
                        <AuthError size="sm">
                            Falha ao se conectar ao Google, verifique se você se habilitou as
                            permissões de acesso ao Goggle Calendar.
                        </AuthError>
                    )}

                    <Button type="submit" onClick={handleNavigateToNextStep} disabled={!isSignedIn}>
                        Próximo passo
                        <ArrowRight />
                    </Button>
                </ConnectBox>
            </Container>
        </>
    )
}