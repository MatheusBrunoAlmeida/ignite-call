import { Button, Text, TextInput } from "@ignite-ui/react";
import { ArrowRight } from "phosphor-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormAnnotation } from "./styles";
import { useRouter } from "next/router";
import { zodResolver } from '@hookform/resolvers/zod'

const claimUsernameFormSchema = z.object({
    username: z.string()
        .min(3, { message: 'O úsuario precisa ter pelo menos 3 letras' })
        .regex(/^([a-z\\-]+)$/i, {
            message: 'O úsuario pode ter apenas letras e hífens.',
        })
        .transform(username => username.toLowerCase()),
})

type ClaimUsernameFormData = z.infer<typeof claimUsernameFormSchema>

export function ClaimUsernameForm() {
    const { register, handleSubmit, formState: { errors } } = useForm<ClaimUsernameFormData>({
        resolver: zodResolver(claimUsernameFormSchema)
    })

    const router = useRouter()

    async function handleClaimUsername(data: ClaimUsernameFormData) {
        // const { username } = data

        // await router.push()

        console.log(data)
    }

    return (
        <>
            <Form as="form" onSubmit={handleSubmit(handleClaimUsername)}>
                <TextInput
                    size="sm"
                    prefix="ignite.com/"
                    placeholder="seu-usuario"
                    {...register('username')}
                />
                <Button
                    size="sm"
                    type="submit"
                >
                    Reservar
                    <ArrowRight />
                </Button>
            </Form>
            <FormAnnotation>
                <Text size="sm">
                    {errors.username ? errors.username.message : 'Digite o nome do úsuario desejado'}
                </Text>
            </FormAnnotation>
        </>
    )
}