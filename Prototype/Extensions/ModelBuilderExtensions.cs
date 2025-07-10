using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Prototype.Extensions;

public static class ModelBuilderExtensions
{
    public static PropertyBuilder<TEnum> HasEnumConversion<TEnum>(this PropertyBuilder<TEnum> builder) 
        where TEnum : struct, Enum
    {
        return builder.HasConversion(
            enumValue => enumValue.ToString(),
            stringValue => (TEnum)Enum.Parse(typeof(TEnum), stringValue)
        );
    }
}
