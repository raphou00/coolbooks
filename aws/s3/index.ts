import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

const provision = () => {
    const stack = pulumi.getStack();

    const files = new aws.s3.Bucket(`coolbooks-files-${stack}`, {
        bucket: `coolbooks-files-${stack}`,
        forceDestroy: true,
    });

    new aws.s3.BucketPolicy(`coolbooks-files-policy-${stack}`, {
        bucket: files.bucket,
        policy: files.bucket.apply((bucketName) =>
            JSON.stringify({
                Version: "2012-10-17",
                Statement: [
                    {
                        Effect: "Allow",
                        Principal: "*",
                        Action: ["s3:GetObject"],
                        Resource: [`arn:aws:s3:::${bucketName}/*`],
                    },
                ],
            })
        ),
    });

    const s3Origin = `coolbooks-s3-origin-${stack}`;
    const cloudfront = new aws.cloudfront.Distribution(
        `coolbooks-cloudfront-${stack}`,
        {
            origins: [
                {
                    domainName: files.bucketRegionalDomainName,
                    originId: s3Origin,
                },
            ],
            enabled: true,
            isIpv6Enabled: true,
            defaultCacheBehavior: {
                allowedMethods: [
                    "DELETE",
                    "GET",
                    "HEAD",
                    "OPTIONS",
                    "PATCH",
                    "POST",
                    "PUT",
                ],
                cachedMethods: ["GET", "HEAD"],
                targetOriginId: s3Origin,
                forwardedValues: {
                    queryString: false,
                    cookies: {
                        forward: "none",
                    },
                },
                viewerProtocolPolicy: "allow-all",
                minTtl: 0,
                defaultTtl: 3600,
                maxTtl: 86400,
            },
            priceClass: "PriceClass_100",
            restrictions: {
                geoRestriction: {
                    restrictionType: "none",
                    locations: [],
                },
            },
            viewerCertificate: {
                cloudfrontDefaultCertificate: true,
            },
        }
    );

    return {
        files,
        cloudfront,
    };
};

export default provision;
