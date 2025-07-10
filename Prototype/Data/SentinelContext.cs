using Microsoft.EntityFrameworkCore;
using Prototype.Enum;
using Prototype.Extensions;
using Prototype.Models;

namespace Prototype.Data;

public class SentinelContext(DbContextOptions<SentinelContext> options) : DbContext(options)
{
    public DbSet<ApplicationConnectionModel> ApplicationConnections { get; set; }
    public DbSet<ApplicationLogModel> ApplicationLogs { get; set; }
    public DbSet<ApplicationModel> Applications { get; set; }
    public DbSet<AuditLogModel> AuditLogs { get; set; }
    public DbSet<AuthenticationModel> Authentications { get; set; }
    public DbSet<DataSourceModel> DataSources { get; set; }
    public DbSet<HumanResourceModel> HumanResources { get; set; }
    public DbSet<TemporaryUserModel> TemporaryUsers { get; set; }
    public DbSet<UserActivityLogModel> UserActivityLogs { get; set; }
    public DbSet<UserApplicationModel> UserApplications { get; set; }
    public DbSet<UserModel> Users { get; set; }
    public DbSet<UserRoleModel> UserRoles { get; set; }
    public DbSet<UserRecoveryRequestModel> UserRecoveryRequests { get; set; }
    public DbSet<UserRequestModel> UserRequests { get; set; }
    public DbSet<BulkUploadHistoryModel> BulkUploadHistories { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        #region ApplicationLogModel

        modelBuilder.Entity<ApplicationLogModel>()
            .Property(al => al.ActionType)
            .HasEnumConversion();

        // Configure the relationship to not cascade delete (preserve logs even when application is deleted)
        modelBuilder.Entity<ApplicationLogModel>()
            .HasOne(al => al.Application)
            .WithMany()
            .HasForeignKey(al => al.ApplicationId)
            .OnDelete(DeleteBehavior.NoAction);

        #endregion

        #region AuditLogModel

        modelBuilder.Entity<AuditLogModel>()
            .Property(al => al.ActionType)
            .HasEnumConversion();

        #endregion

        #region AuthenticationModel

        modelBuilder.Entity<AuthenticationModel>()
            .Property(a => a.Authentication)
            .HasEnumConversion();

        #endregion

        #region HumanResourceModel

        modelBuilder.Entity<HumanResourceModel>()
            .HasOne(hr => hr.User)
            .WithOne()
            .HasForeignKey<HumanResourceModel>(hr => hr.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<HumanResourceModel>()
            .Property(hr => hr.Status)
            .HasEnumConversion();

        #endregion

        #region UserActivityLogModel

        modelBuilder.Entity<UserActivityLogModel>()
            .Property(ual => ual.ActionType)
            .HasEnumConversion();

        #endregion
        
        #region UserApplicationModel

        modelBuilder.Entity<UserApplicationModel>()
            .HasOne(ua => ua.User)
            .WithMany()
            .HasForeignKey(ua => ua.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<UserApplicationModel>()
            .HasOne(ua => ua.Application)
            .WithMany()
            .HasForeignKey(ua => ua.ApplicationId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserApplicationModel>()
            .HasOne(ua => ua.ApplicationConnection)
            .WithMany()
            .HasForeignKey(ua => ua.ApplicationConnectionId)
            .OnDelete(DeleteBehavior.Restrict);

        #endregion
        
        #region UserRecoveryRequestModel

        modelBuilder.Entity<UserRecoveryRequestModel>()
            .Property(urr => urr.RecoveryType)
            .HasEnumConversion();

        modelBuilder.Entity<UserRecoveryRequestModel>()
            .Property(urr => urr.IsUsed)
            .HasDefaultValue(false);

        #endregion
        
        #region UserRequestModel

        modelBuilder.Entity<UserRequestModel>()
            .Property(ur => ur.Status)
            .HasEnumConversion();

        modelBuilder.Entity<UserRequestModel>()
            .Property(ur => ur.Priority)
            .HasEnumConversion();

        modelBuilder.Entity<UserRequestModel>()
            .HasOne(ur => ur.User)
            .WithMany()
            .HasForeignKey(ur => ur.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        #endregion
    }
}
