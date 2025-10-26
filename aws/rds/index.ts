import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import * as random from "@pulumi/random";
import { writeFileSync } from "fs";

const provision = () => {
    const stack = pulumi.getStack();

    const vpc = new aws.ec2.Vpc(`coolbooks-vpc-${stack}`, {
        cidrBlock: "172.30.0.0/16",
        enableDnsHostnames: true,
        enableDnsSupport: true,
    });

    const igw = new aws.ec2.InternetGateway(
        `coolbooks-internet-gateway-${stack}`,
        {
            vpcId: vpc.id,
        }
    );

    const publicSubnetA = new aws.ec2.Subnet(
        `coolbooks-public-subnet-a-${stack}`,
        {
            vpcId: vpc.id,
            cidrBlock: "172.30.1.0/24",
            mapPublicIpOnLaunch: true,
            availabilityZone: "us-east-1a",
        }
    );

    const publicSubnetB = new aws.ec2.Subnet(
        `coolbooks-public-subnet-b-${stack}`,
        {
            vpcId: vpc.id,
            cidrBlock: "172.30.2.0/24",
            mapPublicIpOnLaunch: true,
            availabilityZone: "us-east-1b",
        }
    );

    const routeTable = new aws.ec2.RouteTable(
        `coolbooks-route-table-${stack}`,
        {
            vpcId: vpc.id,
            routes: [
                {
                    cidrBlock: "0.0.0.0/0",
                    gatewayId: igw.id,
                },
            ],
        }
    );

    new aws.ec2.RouteTableAssociation(
        `coolbooks-route-table-association-a-${stack}`,
        {
            routeTableId: routeTable.id,
            subnetId: publicSubnetA.id,
        }
    );

    new aws.ec2.RouteTableAssociation(
        `coolbooks-route-table-association-b-${stack}`,
        {
            routeTableId: routeTable.id,
            subnetId: publicSubnetB.id,
        }
    );

    const securityGroup = new aws.ec2.SecurityGroup(
        `coolbooks-security-group-${stack}`,
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
        `coolbooks-rds-subnet-group-${stack}`,
        {
            subnetIds: [publicSubnetA.id, publicSubnetB.id],
        }
    );

    const rdsPassword = new random.RandomPassword(
        `coolbooks-rds-password-${stack}`,
        {
            length: 16,
            special: false,
            overrideSpecial: "_",
        }
    ).result;

    const rds = new aws.rds.Instance(`coolbooks-rds-${stack}`, {
        identifier: `coolbooks-rds-${stack}`,
        engine: "postgres",
        instanceClass: aws.rds.InstanceType.T4G_Micro,
        storageType: "gp2",
        allocatedStorage: 20,
        dbName: "coolbooks",
        username: "postgres",
        password: rdsPassword,
        publiclyAccessible: true,
        skipFinalSnapshot: false,
        finalSnapshotIdentifier: `coolbooks-final-snapshot-${stack}-${crypto.randomUUID().replace(/-/g, "")}`,
        vpcSecurityGroupIds: [securityGroup.id],
        dbSubnetGroupName: rdsSubnetGroup.id,
    });

    const dbUrl = pulumi.interpolate`postgresql://${rds.username}:${rdsPassword}@${rds.endpoint}/${rds.dbName}`;
    dbUrl.apply((url) => writeFileSync("../DATABASE_URL", url));

    return rds;
};

export default provision;
