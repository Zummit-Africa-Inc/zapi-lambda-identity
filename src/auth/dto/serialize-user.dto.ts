import { Expose, Exclude } from "class-transformer"

export class SerializeUserDto {
    @Expose()
    id: string

    @Expose()
    fullName: string

    @Expose()
    email: string

    @Expose()
    profileID: string
}

