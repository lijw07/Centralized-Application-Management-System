using Prototype.DTOs;
using Prototype.Models;

namespace Prototype.Services.Interfaces;

public interface IUserRecoveryRequestFactoryService
{
    UserRecoveryRequestModel CreateUserRecoveryRequest(UserModel user, ForgotUserRequestDto dto, string verificationCode);
}