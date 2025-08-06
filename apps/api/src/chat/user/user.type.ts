import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field({ nullable: true })
  id?: number;

  @Field()
  first_name: string;

  @Field({nullable: true})
  last_name?: string;

  @Field({ nullable: true })
  password?: string;

  @Field({ nullable: true })
  profile_img?: string;

  @Field({nullable: true})
  phone_number?: string;

  @Field({ nullable: true })
  is_active?: boolean;

  @Field({ nullable: true })
  last_online?: Date;

  @Field({ nullable: true })
  createdAt?: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}
