import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { CrudRequest, GetManyDefaultResponse } from '@nestjsx/crud'
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm'
import { Repository } from 'typeorm'

import { ForbiddenException } from '../../../exceptions/forbidden/forbidden.exception'
import { EntityNotFoundException } from '../../../exceptions/not-found/entity-not-found.exception'

import { UserEntity } from '../entities/user.entity'

import { RoleEnum } from '../../../models/enums/role.enum'
import { CreateUserDto } from '../models/create-user.dto'

import { PasswordService } from '../../password/services/password.service'
import { PermissionService } from '../../permission/services/permission.service'

import { isGetMany } from '../../../utils/crud-request'

/**
 * Service that deals with the user data.
 */
@Injectable()
export class UserService extends TypeOrmCrudService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
    private readonly passwordService: PasswordService,
    private readonly permissionService: PermissionService,
  ) {
    super(repository)
  }

  /**
   * Method that creates a new entity based on the sent payload.
   *
   * @param _crudRequest defines an object that represent the sent request.
   * @param payload defines an object that has the entity data.
   * @returns an object that represents the created entity.
   */
  async createOne(
    _crudRequest: CrudRequest,
    payload: CreateUserDto,
  ): Promise<UserEntity> {
    const hasUserWithEmail = await this.hasUserWithEmail(payload.email)

    if (hasUserWithEmail) {
      throw new BadRequestException(
        'An user with this email was already registered',
      )
    }

    const user = new UserEntity(payload)

    user.password = await this.passwordService.encryptPassword(user.password)
    user.role = RoleEnum.common

    return await this.repository.save(user)
  }

  /**
   * Method that searches for one entity based on it id.
   *
   * @param crudRequest defines an object that represent the sent request.
   * @param requestUser defines an object that represents the logged user.
   * @returns an object that represents the found entity.
   */
  async getOne(
    crudRequest: CrudRequest,
    requestUser?: UserEntity,
  ): Promise<UserEntity> {
    const id = this.getParamFilters(crudRequest.parsed).id
    if (!this.permissionService.hasPermission(requestUser, id)) {
      throw new ForbiddenException()
    }

    const user = await super.getOne(crudRequest)
    if (!user) {
      throw new EntityNotFoundException(id, UserEntity)
    }

    return user
  }

  /**
   * Method that searches for one entity based on the request user id.
   *
   * @param crudRequest defines an object that represent the sent request.
   * @param requestUser defines an object that represents the logged user.
   * @returns an object that represents the found entity.
   */
  async getMe(
    crudRequest: CrudRequest,
    requestUser?: UserEntity,
  ): Promise<UserEntity> {
    const { id } = requestUser

    crudRequest.parsed.search.$and.push({
      id: {
        $eq: id,
      },
    })

    const user = await super.getOne(crudRequest)
    if (!user) {
      throw new EntityNotFoundException(id, UserEntity)
    }

    return user
  }

  /**
   * Method that searches for several entities.
   *
   * @param crudRequest defines an object that represent the sent request.
   * @param requestUser defines an object that represents the logged user.
   * @returns an object that represents all the the found entities.
   */
  async getMany(
    crudRequest: CrudRequest,
    requestUser?: UserEntity,
  ): Promise<GetManyDefaultResponse<UserEntity> | UserEntity[]> {
    const users = await super.getMany(crudRequest)

    const hasPermission = (isGetMany(users) ? users.data : users).every(
      (user) => this.permissionService.hasPermission(requestUser, user.id),
    )

    if (!hasPermission) {
      throw new ForbiddenException()
    }

    return users
  }

  /**
   * Method that checks if some email is already related to some user.
   *
   * @param email defines the email that will be checked.
   * @returns true if the email already exists, otherwise false.
   */
  async hasUserWithEmail(email: string): Promise<boolean> {
    const user = await this.repository.findOne({ email })
    return !!user
  }
}
