
export enum DataSourceTypeEnum {
    MicrosoftSqlServer = 0,
    MySql = 1,
    PostgreSql = 2,
    MongoDb = 3,
    Redis = 4,
    Oracle = 5,
    MariaDb = 6,
    Sqlite = 7,
    Cassandra = 8,
    ElasticSearch = 9,
    
    RestApi = 10,
    GraphQL = 11,
    SoapApi = 12,
    ODataApi = 13,
    WebSocket = 14,
    
    CsvFile = 15,
    JsonFile = 16,
    XmlFile = 17,
    ExcelFile = 18,
    TextFile = 19,
    ParquetFile = 20,
    AvroFile = 21,
    
    AmazonS3 = 22,
    AzureBlobStorage = 23,
    GoogleCloudStorage = 24,
    
    RabbitMq = 25,
    ApacheKafka = 26,
    AzureServiceBus = 27,
    AmazonSqs = 28,
    
    CouchDb = 29,
    DynamoDb = 30,
    CosmosDb = 31,
    
    Memcached = 32,
    
    InfluxDb = 33,
    TimescaleDb = 34,
    
    Neo4j = 35,
    AmazonNeptune = 36,
    
    Solr = 37,
    
    Snowflake = 38,
    BigQuery = 39,
    Redshift = 40,
    
    Ftp = 41,
    Sftp = 42
}

export enum AuthenticationTypeEnum {
    UserPassword = 0,
    WindowsIntegrated = 1,
    Kerberos = 2,
    AzureAdPassword = 3,
    AzureAdInteractive = 4,
    AzureAdIntegrated = 5,
    AzureAdServicePrincipal = 6,
    AzureAdManagedIdentity = 7,
    NoAuth = 8,
    ScramSha1 = 9,
    ScramSha256 = 10,
    AwsIam = 11,
    X509 = 12,
    Ldap = 13,
    Plain = 14,
    CramMd5 = 15,
    DigestMd5 = 16,
    External = 17,
    GssApi = 18,
    MongoDbCr = 19,
    MongoDbX509 = 20,
    ApiKey = 21,
    BearerToken = 22,
    BasicAuth = 23,
    OAuth1 = 24,
    OAuth2 = 25,
    JwtToken = 26,
    CustomHeader = 27,
    CertificateAuth = 28,
    SaslPlain = 29,
    SaslScramSha256 = 30,
    SaslScramSha512 = 31,
    SaslOAuthBearer = 32,
    SaslGssApi = 33,
    ConnectionString = 34,
    EnvironmentVariable = 35,
    ConfigFile = 36,
    KeyVault = 37,
    HashiCorpVault = 38,
    AwsSecretsManager = 39,
    AzureKeyVault = 40,
    GoogleSecretManager = 41,
    DatabaseAuth = 42,
    LdapAuth = 43,
    ActiveDirectory = 44,
    SingleSignOn = 45,
    MultiFactorAuth = 46
}

export enum ActionTypeEnum {
    Create = 0,
    CreateUser = 1,
    Read = 2,
    Update = 3,
    Get = 4,
    Delete = 5,
    Login = 6,
    Logout = 7,
    AssignPermission = 8,
    RevokePermission = 9,
    ChangePassword = 10,
    ChangeUsername = 11,
    FailedLogin = 12,
    Export = 13,
    Import = 14,
    Approve = 15,
    Reject = 16,
    Enable = 17,
    Disable = 18,
    ForgotUsername = 19,
    ForgotPassword = 20,
    ConnectionAttempt = 21,
    ConnectionSuccess = 22,
    ConnectionFailure = 23,
    ConnectionChanged = 24,
    ApplicationAdded = 25,
    ApplicationRemoved = 26,
    StatusChanged = 27,
    HealthCheck = 28,
    ResponseTimeMeasured = 29,
    ErrorLogged = 30,
    Other = 31,
    ApplicationUpdated = 32,
    VerifyUser = 33,
    ResetPassword = 34,
    Register = 35,
    RoleCreated = 36,
    RoleUpdated = 37,
    RoleDeleted = 38,
    UserProvisioned = 39,
    ReportGenerated = 40
}

export const getDataSourceTypeName = (value: number): string => {
    return DataSourceTypeEnum[value] || 'Unknown';
};

export const getAuthenticationTypeName = (value: number): string => {
    return AuthenticationTypeEnum[value] || 'Unknown';
};

export const getActionTypeName = (value: number): string => {
    return ActionTypeEnum[value] || 'Unknown';
};
