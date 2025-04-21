import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import * as random from "@pulumi/random";

const stack = pulumi.getStack();

const vpc = new aws.ec2.Vpc(`pinksea-vpc-${stack}`, {
    cidrBlock: "172.30.0.0/16",
    enableDnsHostnames: true,
    enableDnsSupport: true,
});

const igw = new aws.ec2.InternetGateway(`pinksea-internet-gateway-${stack}`, {
    vpcId: vpc.id,
});

const publicSubnetA = new aws.ec2.Subnet(`pinksea-public-subnet-a-${stack}`, {
    vpcId: vpc.id,
    cidrBlock: "172.30.1.0/24",
    mapPublicIpOnLaunch: true,
    availabilityZone: "us-east-1a",
});

const publicSubnetB = new aws.ec2.Subnet(`pinksea-public-subnet-b-${stack}`, {
    vpcId: vpc.id,
    cidrBlock: "172.30.2.0/24",
    mapPublicIpOnLaunch: true,
    availabilityZone: "us-east-1b",
});

const routeTable = new aws.ec2.RouteTable(`pinksea-route-table-${stack}`, {
    vpcId: vpc.id,
    routes: [
        {
            cidrBlock: "0.0.0.0/0",
            gatewayId: igw.id,
        },
    ],
});

new aws.ec2.RouteTableAssociation(
    `pinksea-route-table-association-a-${stack}`,
    {
        routeTableId: routeTable.id,
        subnetId: publicSubnetA.id,
    }
);

new aws.ec2.RouteTableAssociation(
    `pinksea-route-table-association-b-${stack}`,
    {
        routeTableId: routeTable.id,
        subnetId: publicSubnetB.id,
    }
);

const securityGroup = new aws.ec2.SecurityGroup(
    `pinksea-security-group-${stack}`,
    {
        vpcId: vpc.id,
        ingress: [
            {
                protocol: "-1",
                fromPort: 0,
                toPort: 0,
                cidrBlocks: ["0.0.0.0/0"],
            },
        ],
        egress: [
            {
                protocol: "-1",
                fromPort: 0,
                toPort: 0,
                cidrBlocks: ["0.0.0.0/0"],
            },
        ],
    }
);

const rdsSubnetGroup = new aws.rds.SubnetGroup(
    `pinksea-rds-subnet-group-${stack}`,
    {
        subnetIds: [publicSubnetA.id, publicSubnetB.id],
    }
);

const rdsPassword = new random.RandomPassword(`pinksea-rds-password-${stack}`, {
    length: 16,
    special: false,
    overrideSpecial: "_",
}).result;

const rds = new aws.rds.Instance(`pinksea-rds-${stack}`, {
    identifier: `pinksea-rds-${stack}`,
    engine: "postgres",
    instanceClass: aws.rds.InstanceType.T4G_Micro,
    storageType: "gp2",
    allocatedStorage: 20,
    dbName: "pinksea",
    username: "postgres",
    password: rdsPassword,
    publiclyAccessible: true,
    skipFinalSnapshot: false,
    finalSnapshotIdentifier: `pinksea-final-snapshot-${stack}-${crypto.randomUUID().replace(/-/g, "")}`,
    vpcSecurityGroupIds: [securityGroup.id],
    dbSubnetGroupName: rdsSubnetGroup.id,
});

const dbUrl = pulumi.interpolate`postgresql://${rds.username}:${rdsPassword}@${rds.endpoint}/${rds.dbName}`;

const files = new aws.s3.Bucket(`pinksea-files-${stack}`, {
    bucket: `pinksea-files-${stack}`,
    acl: "public-read",
    forceDestroy: true,
});

new aws.s3.BucketPolicy(`pinksea-files-policy-${stack}`, {
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

const s3Origin = `pinksea-s3-origin-${stack}`;
const cloudfront = new aws.cloudfront.Distribution(
    `pinksea-cloudfront-${stack}`,
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

export const dbEndpoint = rds.endpoint;
export const bucketName = files.bucket;
export const cloudfrontUrl = cloudfront.domainName;
export const dbUrlSecret = dbUrl;
