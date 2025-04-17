# Deployment and Monitoring Solutions for Rapid Consumer Sentiment Analysis

This document outlines the comprehensive deployment and monitoring solutions for the Rapid Consumer Sentiment Analysis service. It covers infrastructure setup, deployment strategies, monitoring systems, scaling approaches, and disaster recovery plans.

## 1. Infrastructure Architecture

### Cloud Infrastructure Overview

The Rapid Consumer Sentiment Analysis service will be deployed on AWS for its comprehensive service offerings, reliability, and scalability. The infrastructure is designed with the following principles:

- **Microservices Architecture**: Separate deployable components for better scalability and maintenance
- **Infrastructure as Code**: All infrastructure defined and managed through code
- **High Availability**: Multiple availability zones to ensure service continuity
- **Security by Design**: Security controls implemented at all layers
- **Cost Optimization**: Resources scaled based on demand

### Infrastructure Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                AWS Cloud                                 │
│                                                                         │
│  ┌─────────────┐     ┌─────────────┐      ┌─────────────────────────┐   │
│  │ Route 53    │────▶│ CloudFront  │─────▶│ Application Load        │   │
│  │ DNS         │     │ CDN         │      │ Balancer                │   │
│  └─────────────┘     └─────────────┘      └───────────┬─────────────┘   │
│                                                       │                  │
│                                                       ▼                  │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                      Auto Scaling Group                          │    │
│  │                                                                  │    │
│  │   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │    │
│  │   │ EC2 Instance│    │ EC2 Instance│    │ EC2 Instance│          │    │
│  │   │ Web Server  │    │ Web Server  │    │ Web Server  │          │    │
│  │   └──────┬──────┘    └──────┬──────┘    └──────┬──────┘          │    │
│  └──────────┼─────────────────┼─────────────────┼─────────────────┘    │
│             │                  │                 │                       │
│             ▼                  ▼                 ▼                       │
│  ┌──────────────────────────────────────────────────────────────┐       │
│  │                      Auto Scaling Group                       │       │
│  │                                                               │       │
│  │   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐       │       │
│  │   │ EC2 Instance│    │ EC2 Instance│    │ EC2 Instance│       │       │
│  │   │ API Server  │    │ API Server  │    │ API Server  │       │       │
│  │   └──────┬──────┘    └──────┬──────┘    └──────┬──────┘       │       │
│  └──────────┼─────────────────┼─────────────────┼────────────┘       │
│             │                  │                 │                       │
│             ▼                  ▼                 ▼                       │
│  ┌──────────────┐     ┌───────────────┐    ┌───────────────┐            │
│  │ Amazon RDS   │     │ ElastiCache   │    │ Amazon S3     │            │
│  │ Database     │     │ Redis         │    │ Storage       │            │
│  └──────────────┘     └───────────────┘    └───────────────┘            │
│                                                                         │
│  ┌──────────────┐     ┌───────────────┐    ┌───────────────┐            │
│  │ SQS          │     │ Lambda        │    │ CloudWatch    │            │
│  │ Message Queue│────▶│ Functions     │────▶│ Monitoring    │            │
│  └──────────────┘     └───────────────┘    └───────────────┘            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Component Details

1. **DNS and Content Delivery**
   - Route 53 for DNS management
   - CloudFront for content delivery and caching

2. **Load Balancing and Auto Scaling**
   - Application Load Balancer for HTTP/HTTPS traffic
   - Auto Scaling Groups for web and API servers

3. **Compute Resources**
   - EC2 instances for web and API servers
   - Lambda functions for event-driven processing

4. **Data Storage**
   - RDS for relational database (PostgreSQL)
   - ElastiCache (Redis) for caching and session management
   - S3 for audio file storage and static assets

5. **Message Processing**
   - SQS for asynchronous processing of audio analysis

6. **Monitoring and Logging**
   - CloudWatch for metrics, logs, and alarms
   - X-Ray for distributed tracing

## 2. Infrastructure as Code (IaC)

All infrastructure will be defined and managed using Terraform to ensure consistency, version control, and reproducibility.

### Terraform Configuration

```hcl
# main.tf

provider "aws" {
  region = var.aws_region
}

# VPC and Networking
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  
  name = "rapid-sentiment-vpc"
  cidr = "10.0.0.0/16"
  
  azs             = ["${var.aws_region}a", "${var.aws_region}b", "${var.aws_region}c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
  
  enable_nat_gateway = true
  single_nat_gateway = false
  
  tags = {
    Environment = var.environment
    Project     = "rapid-sentiment-analysis"
  }
}

# Security Groups
resource "aws_security_group" "web" {
  name        = "web-sg"
  description = "Security group for web servers"
  vpc_id      = module.vpc.vpc_id
  
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name        = "web-sg"
    Environment = var.environment
  }
}

resource "aws_security_group" "api" {
  name        = "api-sg"
  description = "Security group for API servers"
  vpc_id      = module.vpc.vpc_id
  
  ingress {
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.web.id]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name        = "api-sg"
    Environment = var.environment
  }
}

resource "aws_security_group" "db" {
  name        = "db-sg"
  description = "Security group for database"
  vpc_id      = module.vpc.vpc_id
  
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.api.id]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name        = "db-sg"
    Environment = var.environment
  }
}

# Database
resource "aws_db_subnet_group" "default" {
  name       = "main"
  subnet_ids = module.vpc.private_subnets
  
  tags = {
    Name        = "DB subnet group"
    Environment = var.environment
  }
}

resource "aws_db_instance" "postgres" {
  identifier             = "rapid-sentiment-db"
  engine                 = "postgres"
  engine_version         = "13.4"
  instance_class         = "db.t3.medium"
  allocated_storage      = 20
  storage_type           = "gp2"
  username               = var.db_username
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.default.name
  vpc_security_group_ids = [aws_security_group.db.id]
  parameter_group_name   = "default.postgres13"
  publicly_accessible    = false
  skip_final_snapshot    = true
  
  tags = {
    Name        = "rapid-sentiment-db"
    Environment = var.environment
  }
}

# ElastiCache Redis
resource "aws_elasticache_subnet_group" "default" {
  name       = "redis-subnet-group"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "rapid-sentiment-redis"
  engine               = "redis"
  node_type            = "cache.t3.small"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis6.x"
  engine_version       = "6.x"
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.default.name
  security_group_ids   = [aws_security_group.api.id]
  
  tags = {
    Name        = "rapid-sentiment-redis"
    Environment = var.environment
  }
}

# S3 Bucket for Audio Storage
resource "aws_s3_bucket" "audio_storage" {
  bucket = "rapid-sentiment-audio-${var.environment}"
  acl    = "private"
  
  versioning {
    enabled = true
  }
  
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
  
  lifecycle_rule {
    enabled = true
    
    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }
    
    transition {
      days          = 90
      storage_class = "GLACIER"
    }
  }
  
  tags = {
    Name        = "audio-storage"
    Environment = var.environment
  }
}

# SQS Queue for Audio Processing
resource "aws_sqs_queue" "audio_processing" {
  name                      = "audio-processing-queue"
  delay_seconds             = 0
  max_message_size          = 262144
  message_retention_seconds = 86400
  receive_wait_time_seconds = 10
  
  tags = {
    Name        = "audio-processing-queue"
    Environment = var.environment
  }
}

# Lambda Function for Audio Processing
resource "aws_lambda_function" "audio_processor" {
  function_name = "audio-processor"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "index.handler"
  runtime       = "nodejs14.x"
  timeout       = 300
  memory_size   = 1024
  
  environment {
    variables = {
      HUME_AI_API_KEY = var.hume_ai_api_key
      GEMINI_API_KEY  = var.gemini_api_key
      S3_BUCKET       = aws_s3_bucket.audio_storage.bucket
      DB_HOST         = aws_db_instance.postgres.address
      DB_NAME         = aws_db_instance.postgres.name
      DB_USER         = var.db_username
      DB_PASSWORD     = var.db_password
    }
  }
  
  tags = {
    Name        = "audio-processor"
    Environment = var.environment
  }
}

# Application Load Balancer
resource "aws_lb" "api" {
  name               = "api-lb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.web.id]
  subnets            = module.vpc.public_subnets
  
  tags = {
    Name        = "api-lb"
    Environment = var.environment
  }
}

resource "aws_lb_target_group" "api" {
  name     = "api-tg"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = module.vpc.vpc_id
  
  health_check {
    path                = "/health"
    port                = "traffic-port"
    healthy_threshold   = 3
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
  }
}

resource "aws_lb_listener" "api" {
  load_balancer_arn = aws_lb.api.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = var.certificate_arn
  
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }
}

# Auto Scaling Group for API Servers
resource "aws_launch_template" "api" {
  name_prefix   = "api-"
  image_id      = var.api_ami_id
  instance_type = "t3.medium"
  
  vpc_security_group_ids = [aws_security_group.api.id]
  
  user_data = base64encode(<<-EOF
    #!/bin/bash
    echo "DB_HOST=${aws_db_instance.postgres.address}" >> /etc/environment
    echo "DB_NAME=${aws_db_instance.postgres.name}" >> /etc/environment
    echo "DB_USER=${var.db_username}" >> /etc/environment
    echo "DB_PASSWORD=${var.db_password}" >> /etc/environment
    echo "REDIS_HOST=${aws_elasticache_cluster.redis.cache_nodes.0.address}" >> /etc/environment
    echo "S3_BUCKET=${aws_s3_bucket.audio_storage.bucket}" >> /etc/environment
    echo "HUME_AI_API_KEY=${var.hume_ai_api_key}" >> /etc/environment
    echo "GEMINI_API_KEY=${var.gemini_api_key}" >> /etc/environment
    echo "NODE_ENV=${var.environment}" >> /etc/environment
    
    cd /opt/rapid-sentiment-api
    npm install
    pm2 start ecosystem.config.js
  EOF
  )
  
  tag_specifications {
    resource_type = "instance"
    
    tags = {
      Name        = "api-server"
      Environment = var.environment
    }
  }
}

resource "aws_autoscaling_group" "api" {
  name                = "api-asg"
  vpc_zone_identifier = module.vpc.private_subnets
  desired_capacity    = 2
  min_size            = 2
  max_size            = 10
  
  launch_template {
    id      = aws_launch_template.api.id
    version = "$Latest"
  }
  
  target_group_arns = [aws_lb_target_group.api.arn]
  
  tag {
    key                 = "Name"
    value               = "api-server"
    propagate_at_launch = true
  }
  
  tag {
    key                 = "Environment"
    value               = var.environment
    propagate_at_launch = true
  }
}

# CloudWatch Alarms
resource "aws_cloudwatch_metric_alarm" "api_cpu" {
  alarm_name          = "api-cpu-alarm"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 120
  statistic           = "Average"
  threshold           = 70
  
  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.api.name
  }
  
  alarm_description = "This metric monitors API server CPU utilization"
  alarm_actions     = [aws_autoscaling_policy.api_scale_up.arn]
}

resource "aws_autoscaling_policy" "api_scale_up" {
  name                   = "api-scale-up"
  scaling_adjustment     = 1
  adjustment_type        = "ChangeInCapacity"
  cooldown               = 300
  autoscaling_group_name = aws_autoscaling_group.api.name
}

resource "aws_autoscaling_policy" "api_scale_down" {
  name                   = "api-scale-down"
  scaling_adjustment     = -1
  adjustment_type        = "ChangeInCapacity"
  cooldown               = 300
  autoscaling_group_name = aws_autoscaling_group.api.name
}

resource "aws_cloudwatch_metric_alarm" "api_cpu_low" {
  alarm_name          = "api-cpu-low-alarm"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 120
  statistic           = "Average"
  threshold           = 30
  
  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.api.name
  }
  
  alarm_description = "This metric monitors low API server CPU utilization"
  alarm_actions     = [aws_autoscaling_policy.api_scale_down.arn]
}
```

### Variables Configuration

```hcl
# variables.tf

variable "aws_region" {
  description = "AWS region to deploy resources"
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment (e.g., dev, staging, prod)"
  default     = "dev"
}

variable "db_username" {
  description = "Database username"
  sensitive   = true
}

variable "db_password" {
  description = "Database password"
  sensitive   = true
}

variable "hume_ai_api_key" {
  description = "Hume AI API key"
  sensitive   = true
}

variable "gemini_api_key" {
  description = "Gemini API key"
  sensitive   = true
}

variable "api_ami_id" {
  description = "AMI ID for API servers"
}

variable "certificate_arn" {
  description = "ARN of SSL certificate for HTTPS"
}
```

### Outputs Configuration

```hcl
# outputs.tf

output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

output "db_endpoint" {
  description = "Database endpoint"
  value       = aws_db_instance.postgres.address
}

output "redis_endpoint" {
  description = "Redis endpoint"
  value       = aws_elasticache_cluster.redis.cache_nodes.0.address
}

output "s3_bucket" {
  description = "S3 bucket for audio storage"
  value       = aws_s3_bucket.audio_storage.bucket
}

output "api_load_balancer_dns" {
  description = "DNS name of the API load balancer"
  value       = aws_lb.api.dns_name
}
```

## 3. Deployment Strategy

The deployment strategy is designed to minimize downtime, reduce risk, and enable rapid rollback if issues are detected.

### CI/CD Pipeline

The CI/CD pipeline will be implemented using GitHub Actions to automate the build, test, and deployment process.

```yaml
# .github/workflows/deploy.yml

name: Deploy Rapid Sentiment Analysis

on:
  push:
    branches: [ main, staging ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build application
        run: npm run build
        
      - name: Upload build artifacts
        uses: actions/upload-artifact@v2
        with:
          name: build
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Download build artifacts
        uses: actions/download-artifact@v2
        with:
          name: build
          path: dist/
          
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
          
      - name: Set environment variables
        run: |
          if [[ $GITHUB_REF == 'refs/heads/main' ]]; then
            echo "ENVIRONMENT=prod" >> $GITHUB_ENV
          else
            echo "ENVIRONMENT=staging" >> $GITHUB_ENV
          fi
          
      - name: Create deployment package
        run: |
          mkdir -p deployment
          cp -r dist/* deployment/
          cp package.json deployment/
          cp ecosystem.config.js deployment/
          cd deployment && zip -r ../deployment.zip .
          
      - name: Upload deployment package to S3
        run: |
          aws s3 cp deployment.zip s3://rapid-sentiment-deployments-${{ env.ENVIRONMENT }}/deployment-${{ github.sha }}.zip
          
      - name: Create new application version in CodeDeploy
        run: |
          aws deploy create-application-version \
            --application-name rapid-sentiment-api \
            --version-label ${{ github.sha }} \
            --source-bundle S3Bucket=rapid-sentiment-deployments-${{ env.ENVIRONMENT }},S3Key=deployment-${{ github.sha }}.zip
            
      - name: Deploy application version
        run: |
          aws deploy create-deployment \
            --application-name rapid-sentiment-api \
            --deployment-group-name rapid-sentiment-api-${{ env.ENVIRONMENT }} \
            --deployment-config-name CodeDeployDefault.OneAtATime \
            --version-label ${{ github.sha }}
            
      - name: Wait for deployment to complete
        run: |
          aws deploy wait deployment-successful \
            --deployment-id $(aws deploy list-deployments \
              --application-name rapid-sentiment-api \
              --deployment-group-name rapid-sentiment-api-${{ env.ENVIRONMENT }} \
              --query "deployments[0]" \
              --output text)
              
      - name: Run smoke tests
        run: |
          npm run test:smoke -- --url https://api-${{ env.ENVIRONMENT }}.rapid-sentiment.jadekite.com
          
      - name: Notify Slack on success
        if: success()
        uses: rtCamp/action-slack-notify@v2
        env:
          SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
          SLACK_CHANNEL: deployments
          SLACK_TITLE: Deployment Successful
          SLACK_MESSAGE: "Rapid Sentiment Analysis API has been deployed to ${{ env.ENVIRONMENT }} environment"
          SLACK_COLOR: good
          
      - name: Notify Slack on failure
        if: failure()
        uses: rtCamp/action-slack-notify@v2
        env:
          SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
          SLACK_CHANNEL: deployments
          SLACK_TITLE: Deployment Failed
          SLACK_MESSAGE: "Rapid Sentiment Analysis API deployment to ${{ env.ENVIRONMENT }} environment has failed"
          SLACK_COLOR: danger
```

### Blue-Green Deployment

For production deployments, a blue-green deployment strategy will be used to minimize downtime and risk.

1. **Setup**:
   - Two identical production environments: Blue (current) and Green (new)
   - Route 53 for DNS routing

2. **Deployment Process**:
   - Deploy new version to Green environment
   - Run automated tests on Green environment
   - Gradually shift traffic from Blue to Green using weighted routing
   - Monitor for issues during traffic shift
   - Complete traffic shift when confident in new deployment
   - Keep Blue environment available for quick rollback if needed

3. **Rollback Process**:
   - If issues are detected, shift traffic back to Blue environment
   - Investigate and fix issues in Green environment
   - Retry deployment when issues are resolved

## 4. Monitoring and Alerting

A comprehensive monitoring and alerting system will be implemented to ensure the health, performance, and security of the service.

### Monitoring Components

1. **Infrastructure Monitoring**:
   - CloudWatch for AWS resource metrics
   - Custom metrics for application-specific monitoring
   - Dashboard for real-time visibility

2. **Application Performance Monitoring**:
   - New Relic for detailed application performance insights
   - X-Ray for distributed tracing
   - Custom instrumentation for critical paths

3. **Log Management**:
   - CloudWatch Logs for centralized log collection
   - Log insights for analysis and troubleshooting
   - Log retention policies for compliance

4. **Alerting System**:
   - CloudWatch Alarms for metric-based alerts
   - PagerDuty integration for on-call notification
   - Slack integration for team notifications

### Monitoring Implementation

#### CloudWatch Dashboard Configuration

```json
{
  "widgets": [
    {
      "type": "metric",
      "x": 0,
      "y": 0,
      "width": 12,
      "height": 6,
      "properties": {
        "metrics": [
          [ "AWS/EC2", "CPUUtilization", "AutoScalingGroupName", "api-asg", { "stat": "Average" } ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": "us-east-1",
        "title": "API Server CPU Utilization",
        "period": 300
      }
    },
    {
      "type": "metric",
      "x": 12,
      "y": 0,
      "width": 12,
      "height": 6,
      "properties": {
        "metrics": [
          [ "AWS/ApplicationELB", "RequestCount", "LoadBalancer", "app/api-lb/1234567890abcdef", { "stat": "Sum" } ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": "us-east-1",
        "title": "API Request Count",
        "period": 300
      }
    },
    {
      "type": "metric",
      "x": 0,
      "y": 6,
      "width": 12,
      "height": 6,
      "properties": {
        "metrics": [
          [ "AWS/ApplicationELB", "TargetResponseTime", "LoadBalancer", "app/api-lb/1234567890abcdef", { "stat": "Average" } ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": "us-east-1",
        "title": "API Response Time",
        "period": 300
      }
    },
    {
      "type": "metric",
      "x": 12,
      "y": 6,
      "width": 12,
      "height": 6,
      "properties": {
        "metrics": [
          [ "AWS/SQS", "ApproximateNumberOfMessagesVisible", "QueueName", "audio-processing-queue", { "stat": "Maximum" } ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": "us-east-1",
        "title": "Audio Processing Queue Depth",
        "period": 300
      }
    },
    {
      "type": "metric",
      "x": 0,
      "y": 12,
      "width": 12,
      "height": 6,
      "properties": {
        "metrics": [
          [ "AWS/Lambda", "Invocations", "FunctionName", "audio-processor", { "stat": "Sum" } ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": "us-east-1",
        "title": "Audio Processor Invocations",
        "period": 300
      }
    },
    {
      "type": "metric",
      "x": 12,
      "y": 12,
      "width": 12,
      "height": 6,
      "properties": {
        "metrics": [
          [ "AWS/Lambda", "Errors", "FunctionName", "audio-processor", { "stat": "Sum" } ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": "us-east-1",
        "title": "Audio Processor Errors",
        "period": 300
      }
    },
    {
      "type": "metric",
      "x": 0,
      "y": 18,
      "width": 12,
      "height": 6,
      "properties": {
        "metrics": [
          [ "AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", "rapid-sentiment-db", { "stat": "Average" } ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": "us-east-1",
        "title": "Database CPU Utilization",
        "period": 300
      }
    },
    {
      "type": "metric",
      "x": 12,
      "y": 18,
      "width": 12,
      "height": 6,
      "properties": {
        "metrics": [
          [ "AWS/RDS", "DatabaseConnections", "DBInstanceIdentifier", "rapid-sentiment-db", { "stat": "Average" } ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": "us-east-1",
        "title": "Database Connections",
        "period": 300
      }
    },
    {
      "type": "metric",
      "x": 0,
      "y": 24,
      "width": 12,
      "height": 6,
      "properties": {
        "metrics": [
          [ "AWS/ElastiCache", "CPUUtilization", "CacheClusterId", "rapid-sentiment-redis", { "stat": "Average" } ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": "us-east-1",
        "title": "Redis CPU Utilization",
        "period": 300
      }
    },
    {
      "type": "metric",
      "x": 12,
      "y": 24,
      "width": 12,
      "height": 6,
      "properties": {
        "metrics": [
          [ "AWS/ElastiCache", "CurrConnections", "CacheClusterId", "rapid-sentiment-redis", { "stat": "Average" } ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": "us-east-1",
        "title": "Redis Connections",
        "period": 300
      }
    }
  ]
}
```

#### Custom Metrics Implementation

```javascript
// src/monitoring/metrics.js
const { CloudWatch } = require('aws-sdk');
const cloudwatch = new CloudWatch({ region: process.env.AWS_REGION });

/**
 * Record API request metrics
 */
async function recordApiRequest(endpoint, method, statusCode, responseTime) {
  const params = {
    MetricData: [
      {
        MetricName: 'ApiRequestCount',
        Dimensions: [
          {
            Name: 'Endpoint',
            Value: endpoint
          },
          {
            Name: 'Method',
            Value: method
          },
          {
            Name: 'StatusCode',
            Value: statusCode.toString()
          }
        ],
        Unit: 'Count',
        Value: 1
      },
      {
        MetricName: 'ApiResponseTime',
        Dimensions: [
          {
            Name: 'Endpoint',
            Value: endpoint
          },
          {
            Name: 'Method',
            Value: method
          }
        ],
        Unit: 'Milliseconds',
        Value: responseTime
      }
    ],
    Namespace: 'RapidSentimentAnalysis'
  };
  
  return cloudwatch.putMetricData(params).promise();
}

/**
 * Record audio processing metrics
 */
async function recordAudioProcessing(duration, success) {
  const params = {
    MetricData: [
      {
        MetricName: 'AudioProcessingDuration',
        Unit: 'Seconds',
        Value: duration
      },
      {
        MetricName: success ? 'AudioProcessingSuccess' : 'AudioProcessingFailure',
        Unit: 'Count',
        Value: 1
      }
    ],
    Namespace: 'RapidSentimentAnalysis'
  };
  
  return cloudwatch.putMetricData(params).promise();
}

/**
 * Record emotion analysis metrics
 */
async function recordEmotionAnalysis(emotions) {
  const metricData = Object.entries(emotions).map(([emotion, value]) => ({
    MetricName: `Emotion${emotion.charAt(0).toUpperCase() + emotion.slice(1)}`,
    Unit: 'None',
    Value: value
  }));
  
  const params = {
    MetricData: metricData,
    Namespace: 'RapidSentimentAnalysis/EmotionAnalysis'
  };
  
  return cloudwatch.putMetricData(params).promise();
}

/**
 * Record third-party API metrics
 */
async function recordThirdPartyApiCall(service, endpoint, success, duration) {
  const params = {
    MetricData: [
      {
        MetricName: 'ThirdPartyApiCallDuration',
        Dimensions: [
          {
            Name: 'Service',
            Value: service
          },
          {
            Name: 'Endpoint',
            Value: endpoint
          }
        ],
        Unit: 'Milliseconds',
        Value: duration
      },
      {
        MetricName: success ? 'ThirdPartyApiCallSuccess' : 'ThirdPartyApiCallFailure',
        Dimensions: [
          {
            Name: 'Service',
            Value: service
          },
          {
            Name: 'Endpoint',
            Value: endpoint
          }
        ],
        Unit: 'Count',
        Value: 1
      }
    ],
    Namespace: 'RapidSentimentAnalysis'
  };
  
  return cloudwatch.putMetricData(params).promise();
}

module.exports = {
  recordApiRequest,
  recordAudioProcessing,
  recordEmotionAnalysis,
  recordThirdPartyApiCall
};
```

#### Middleware for Request Tracking

```javascript
// src/middleware/request-tracker.js
const { recordApiRequest } = require('../monitoring/metrics');

/**
 * Middleware to track API requests
 */
function requestTracker(req, res, next) {
  const start = Date.now();
  
  // Add response listener to capture metrics after request completes
  res.on('finish', () => {
    const duration = Date.now() - start;
    const endpoint = req.route ? req.route.path : req.path;
    const method = req.method;
    const statusCode = res.statusCode;
    
    // Record metrics asynchronously
    recordApiRequest(endpoint, method, statusCode, duration)
      .catch(err => console.error('Error recording metrics:', err));
  });
  
  next();
}

module.exports = requestTracker;
```

#### Alerting Configuration

```javascript
// src/monitoring/alerts.js
const { CloudWatch } = require('aws-sdk');
const axios = require('axios');
const cloudwatch = new CloudWatch({ region: process.env.AWS_REGION });

/**
 * Create CloudWatch alarm for API error rate
 */
async function createApiErrorRateAlarm() {
  const params = {
    AlarmName: 'ApiErrorRateAlarm',
    ComparisonOperator: 'GreaterThanThreshold',
    EvaluationPeriods: 2,
    MetricName: 'ApiRequestCount',
    Namespace: 'RapidSentimentAnalysis',
    Period: 300,
    Statistic: 'Sum',
    Threshold: 5,
    ActionsEnabled: true,
    AlarmDescription: 'Alarm when API error rate exceeds threshold',
    Dimensions: [
      {
        Name: 'StatusCode',
        Value: '5xx'
      }
    ],
    AlarmActions: [
      process.env.SNS_ALARM_TOPIC_ARN
    ]
  };
  
  return cloudwatch.putMetricAlarm(params).promise();
}

/**
 * Create CloudWatch alarm for audio processing failures
 */
async function createAudioProcessingFailureAlarm() {
  const params = {
    AlarmName: 'AudioProcessingFailureAlarm',
    ComparisonOperator: 'GreaterThanThreshold',
    EvaluationPeriods: 2,
    MetricName: 'AudioProcessingFailure',
    Namespace: 'RapidSentimentAnalysis',
    Period: 300,
    Statistic: 'Sum',
    Threshold: 3,
    ActionsEnabled: true,
    AlarmDescription: 'Alarm when audio processing failures exceed threshold',
    AlarmActions: [
      process.env.SNS_ALARM_TOPIC_ARN
    ]
  };
  
  return cloudwatch.putMetricAlarm(params).promise();
}

/**
 * Create CloudWatch alarm for third-party API failures
 */
async function createThirdPartyApiFailureAlarm() {
  const params = {
    AlarmName: 'ThirdPartyApiFailureAlarm',
    ComparisonOperator: 'GreaterThanThreshold',
    EvaluationPeriods: 2,
    MetricName: 'ThirdPartyApiCallFailure',
    Namespace: 'RapidSentimentAnalysis',
    Period: 300,
    Statistic: 'Sum',
    Threshold: 3,
    ActionsEnabled: true,
    AlarmDescription: 'Alarm when third-party API failures exceed threshold',
    AlarmActions: [
      process.env.SNS_ALARM_TOPIC_ARN
    ]
  };
  
  return cloudwatch.putMetricAlarm(params).promise();
}

/**
 * Send alert to Slack
 */
async function sendSlackAlert(message, severity = 'warning') {
  const colors = {
    info: '#36a64f',
    warning: '#ffcc00',
    error: '#ff0000'
  };
  
  const payload = {
    attachments: [
      {
        color: colors[severity] || colors.warning,
        title: 'Rapid Sentiment Analysis Alert',
        text: message,
        fields: [
          {
            title: 'Environment',
            value: process.env.NODE_ENV,
            short: true
          },
          {
            title: 'Severity',
            value: severity.toUpperCase(),
            short: true
          },
          {
            title: 'Timestamp',
            value: new Date().toISOString(),
            short: false
          }
        ]
      }
    ]
  };
  
  return axios.post(process.env.SLACK_WEBHOOK_URL, payload);
}

module.exports = {
  createApiErrorRateAlarm,
  createAudioProcessingFailureAlarm,
  createThirdPartyApiFailureAlarm,
  sendSlackAlert
};
```

### Health Checks and Monitoring Endpoints

```javascript
// src/routes/health.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const redis = require('../redis');
const { S3 } = require('aws-sdk');
const s3 = new S3({ region: process.env.AWS_REGION });

/**
 * Basic health check endpoint
 */
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

/**
 * Detailed health check endpoint
 */
router.get('/health/detailed', async (req, res) => {
  try {
    // Check database connection
    const dbCheck = await checkDatabase();
    
    // Check Redis connection
    const redisCheck = await checkRedis();
    
    // Check S3 access
    const s3Check = await checkS3();
    
    // Check third-party APIs
    const humeAiCheck = await checkHumeAi();
    const geminiCheck = await checkGemini();
    
    // Compile health status
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: dbCheck,
        redis: redisCheck,
        s3: s3Check,
        humeAi: humeAiCheck,
        gemini: geminiCheck
      }
    };
    
    // Determine overall status
    const allChecksOk = Object.values(health.services).every(check => check.status === 'ok');
    if (!allChecksOk) {
      health.status = 'degraded';
    }
    
    res.status(200).json(health);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to complete health check',
      error: error.message
    });
  }
});

/**
 * Check database connection
 */
async function checkDatabase() {
  try {
    const result = await db.query('SELECT 1');
    return {
      status: 'ok',
      responseTime: result.queryTime
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message
    };
  }
}

/**
 * Check Redis connection
 */
async function checkRedis() {
  try {
    const start = Date.now();
    await redis.ping();
    const responseTime = Date.now() - start;
    
    return {
      status: 'ok',
      responseTime
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message
    };
  }
}

/**
 * Check S3 access
 */
async function checkS3() {
  try {
    const start = Date.now();
    await s3.headBucket({ Bucket: process.env.S3_BUCKET }).promise();
    const responseTime = Date.now() - start;
    
    return {
      status: 'ok',
      responseTime
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message
    };
  }
}

/**
 * Check Hume AI API
 */
async function checkHumeAi() {
  try {
    // Implement a lightweight check to Hume AI API
    // This is a placeholder
    return {
      status: 'ok',
      responseTime: 0
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message
    };
  }
}

/**
 * Check Gemini API
 */
async function checkGemini() {
  try {
    // Implement a lightweight check to Gemini API
    // This is a placeholder
    return {
      status: 'ok',
      responseTime: 0
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message
    };
  }
}

module.exports = router;
```

## 5. Scaling Strategy

The scaling strategy is designed to handle varying loads efficiently while maintaining performance and controlling costs.

### Horizontal Scaling

1. **Auto Scaling Groups**:
   - EC2 instances in Auto Scaling Groups for web and API servers
   - Scale based on CPU utilization, request count, and memory usage
   - Scheduled scaling for predictable load patterns

2. **Database Scaling**:
   - RDS with read replicas for read-heavy workloads
   - Vertical scaling for increased capacity
   - Connection pooling to manage database connections

3. **Serverless Components**:
   - Lambda functions for event-driven processing
   - Automatic scaling based on demand
   - Concurrent execution limits to control costs

### Vertical Scaling

1. **Instance Sizing**:
   - Right-sized instances for different components
   - Regular review of resource utilization
   - Upgrade instance types as needed

2. **Database Optimization**:
   - Regular performance tuning
   - Index optimization
   - Query optimization

### Load Testing and Capacity Planning

1. **Load Testing**:
   - Regular load testing to identify bottlenecks
   - Simulate peak traffic scenarios
   - Test scaling policies

2. **Capacity Planning**:
   - Monitor growth trends
   - Forecast future capacity needs
   - Plan for seasonal variations

## 6. Disaster Recovery and Backup Strategy

A comprehensive disaster recovery and backup strategy is essential to ensure business continuity in case of failures or data loss.

### Backup Strategy

1. **Database Backups**:
   - Automated daily snapshots
   - Point-in-time recovery enabled
   - Retention period of 30 days

2. **S3 Data Backups**:
   - Versioning enabled for all objects
   - Cross-region replication for critical data
   - Lifecycle policies for cost optimization

3. **Configuration Backups**:
   - Infrastructure as Code (Terraform) in version control
   - Application configuration in Parameter Store
   - Regular exports of critical configuration

### Disaster Recovery Plan

1. **Recovery Time Objective (RTO)**:
   - Critical systems: 1 hour
   - Non-critical systems: 4 hours

2. **Recovery Point Objective (RPO)**:
   - Database: 5 minutes (using point-in-time recovery)
   - S3 data: Near real-time (using cross-region replication)

3. **Multi-Region Strategy**:
   - Primary region: us-east-1
   - Disaster recovery region: us-west-2
   - Route 53 for failover routing

4. **Recovery Procedures**:
   - Automated failover for database
   - Manual failover for application components
   - Regular testing of recovery procedures

### Disaster Recovery Implementation

```hcl
# dr.tf

# S3 Cross-Region Replication
resource "aws_s3_bucket" "audio_storage_dr" {
  provider = aws.dr_region
  bucket   = "rapid-sentiment-audio-dr-${var.environment}"
  acl      = "private"
  
  versioning {
    enabled = true
  }
  
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
  
  tags = {
    Name        = "audio-storage-dr"
    Environment = var.environment
  }
}

resource "aws_s3_bucket_replication_configuration" "audio_replication" {
  bucket = aws_s3_bucket.audio_storage.id
  
  rule {
    id     = "audio-replication"
    status = "Enabled"
    
    destination {
      bucket        = aws_s3_bucket.audio_storage_dr.arn
      storage_class = "STANDARD"
    }
  }
}

# Database Disaster Recovery
resource "aws_db_instance" "postgres_dr" {
  provider               = aws.dr_region
  identifier             = "rapid-sentiment-db-dr"
  replicate_source_db    = aws_db_instance.postgres.arn
  instance_class         = "db.t3.medium"
  publicly_accessible    = false
  skip_final_snapshot    = true
  backup_retention_period = 7
  
  tags = {
    Name        = "rapid-sentiment-db-dr"
    Environment = var.environment
  }
}

# Route 53 Failover Configuration
resource "aws_route53_health_check" "primary" {
  fqdn              = aws_lb.api.dns_name
  port              = 443
  type              = "HTTPS"
  resource_path     = "/health"
  failure_threshold = 3
  request_interval  = 30
  
  tags = {
    Name = "primary-health-check"
  }
}

resource "aws_route53_record" "api_primary" {
  zone_id = var.route53_zone_id
  name    = "api.rapid-sentiment.jadekite.com"
  type    = "A"
  
  failover_routing_policy {
    type = "PRIMARY"
  }
  
  set_identifier = "primary"
  health_check_id = aws_route53_health_check.primary.id
  
  alias {
    name                   = aws_lb.api.dns_name
    zone_id                = aws_lb.api.zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "api_secondary" {
  provider = aws.dr_region
  zone_id  = var.route53_zone_id
  name     = "api.rapid-sentiment.jadekite.com"
  type     = "A"
  
  failover_routing_policy {
    type = "SECONDARY"
  }
  
  set_identifier = "secondary"
  
  alias {
    name                   = aws_lb.api_dr.dns_name
    zone_id                = aws_lb.api_dr.zone_id
    evaluate_target_health = true
  }
}
```

## 7. Security Measures

Security is a critical aspect of the deployment and monitoring solution, especially when handling sensitive user data.

### Security Components

1. **Network Security**:
   - VPC with public and private subnets
   - Security groups with least privilege access
   - Network ACLs for additional protection
   - VPC Flow Logs for network monitoring

2. **Data Security**:
   - Encryption at rest for all data stores
   - Encryption in transit using TLS
   - Key management using KMS
   - Data classification and handling policies

3. **Identity and Access Management**:
   - IAM roles with least privilege
   - MFA for administrative access
   - Regular access reviews
   - Service accounts for application components

4. **Application Security**:
   - Input validation and sanitization
   - Protection against common vulnerabilities (OWASP Top 10)
   - Regular security scanning
   - Dependency vulnerability management

5. **Compliance and Auditing**:
   - CloudTrail for API activity logging
   - Config for resource configuration tracking
   - Regular compliance assessments
   - Security incident response plan

### Security Implementation

#### WAF Configuration

```hcl
# security.tf

# Web Application Firewall
resource "aws_wafv2_web_acl" "api_waf" {
  name        = "api-waf"
  description = "WAF for API protection"
  scope       = "REGIONAL"
  
  default_action {
    allow {}
  }
  
  # SQL Injection Protection
  rule {
    name     = "SQLInjectionRule"
    priority = 1
    
    statement {
      sql_injection_match_statement {
        field_to_match {
          body {}
        }
        text_transformation {
          priority = 1
          type     = "URL_DECODE"
        }
        text_transformation {
          priority = 2
          type     = "HTML_ENTITY_DECODE"
        }
      }
    }
    
    action {
      block {}
    }
    
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "SQLInjectionRule"
      sampled_requests_enabled   = true
    }
  }
  
  # Cross-Site Scripting Protection
  rule {
    name     = "XSSRule"
    priority = 2
    
    statement {
      xss_match_statement {
        field_to_match {
          body {}
        }
        text_transformation {
          priority = 1
          type     = "URL_DECODE"
        }
        text_transformation {
          priority = 2
          type     = "HTML_ENTITY_DECODE"
        }
      }
    }
    
    action {
      block {}
    }
    
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "XSSRule"
      sampled_requests_enabled   = true
    }
  }
  
  # Rate Limiting
  rule {
    name     = "RateLimitRule"
    priority = 3
    
    statement {
      rate_based_statement {
        limit              = 1000
        aggregate_key_type = "IP"
      }
    }
    
    action {
      block {}
    }
    
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "RateLimitRule"
      sampled_requests_enabled   = true
    }
  }
  
  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "api-waf"
    sampled_requests_enabled   = true
  }
}

# Associate WAF with ALB
resource "aws_wafv2_web_acl_association" "api_waf_association" {
  resource_arn = aws_lb.api.arn
  web_acl_arn  = aws_wafv2_web_acl.api_waf.arn
}
```

#### KMS Key Configuration

```hcl
# security.tf

# KMS Key for Data Encryption
resource "aws_kms_key" "data_encryption_key" {
  description             = "KMS key for data encryption"
  deletion_window_in_days = 30
  enable_key_rotation     = true
  
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Enable IAM User Permissions",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
      },
      "Action": "kms:*",
      "Resource": "*"
    },
    {
      "Sid": "Allow use of the key",
      "Effect": "Allow",
      "Principal": {
        "AWS": [
          "${aws_iam_role.api_role.arn}",
          "${aws_iam_role.lambda_exec.arn}"
        ]
      },
      "Action": [
        "kms:Encrypt",
        "kms:Decrypt",
        "kms:ReEncrypt*",
        "kms:GenerateDataKey*",
        "kms:DescribeKey"
      ],
      "Resource": "*"
    }
  ]
}
EOF
  
  tags = {
    Name        = "data-encryption-key"
    Environment = var.environment
  }
}

resource "aws_kms_alias" "data_encryption_key_alias" {
  name          = "alias/rapid-sentiment-data-key"
  target_key_id = aws_kms_key.data_encryption_key.key_id
}
```

#### Security Headers Middleware

```javascript
// src/middleware/security-headers.js

/**
 * Middleware to add security headers to responses
 */
function securityHeaders(req, res, next) {
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self' https://api.hume.ai https://generativelanguage.googleapis.com;"
  );
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Strict Transport Security
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Feature Policy
  res.setHeader(
    'Feature-Policy',
    "microphone 'self'; camera 'none'; geolocation 'none'"
  );
  
  next();
}

module.exports = securityHeaders;
```

## 8. Cost Optimization

Cost optimization is an important consideration to ensure the service is financially sustainable.

### Cost Optimization Strategies

1. **Resource Right-Sizing**:
   - Use appropriate instance types for workloads
   - Regular review of resource utilization
   - Downsize underutilized resources

2. **Auto Scaling**:
   - Scale resources based on demand
   - Scheduled scaling for predictable patterns
   - Minimum and maximum limits to control costs

3. **Storage Optimization**:
   - Lifecycle policies for S3 objects
   - Storage class transitions
   - Data retention policies

4. **Reserved Instances and Savings Plans**:
   - Reserved Instances for predictable workloads
   - Savings Plans for flexible compute usage
   - Regular review of commitment levels

5. **Serverless for Variable Workloads**:
   - Lambda for event-driven processing
   - Pay only for actual usage
   - Concurrency limits to prevent unexpected costs

### Cost Monitoring and Alerting

```hcl
# cost.tf

# Budget for monitoring costs
resource "aws_budgets_budget" "monthly_budget" {
  name              = "rapid-sentiment-monthly-budget"
  budget_type       = "COST"
  limit_amount      = var.monthly_budget_limit
  limit_unit        = "USD"
  time_unit         = "MONTHLY"
  
  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 80
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = [var.budget_notification_email]
  }
  
  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 100
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = [var.budget_notification_email]
  }
  
  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 90
    threshold_type             = "PERCENTAGE"
    notification_type          = "FORECASTED"
    subscriber_email_addresses = [var.budget_notification_email]
  }
}

# Cost anomaly detection
resource "aws_ce_anomaly_monitor" "cost_monitor" {
  name      = "rapid-sentiment-cost-monitor"
  type      = "DIMENSIONAL"
  
  dimensional_value_count = 1
  
  dimension_value {
    dimension = "SERVICE"
    values    = ["Amazon Elastic Compute Cloud - Compute", "Amazon Relational Database Service", "AWS Lambda"]
  }
}

resource "aws_ce_anomaly_subscription" "cost_subscription" {
  name      = "rapid-sentiment-cost-subscription"
  threshold = 10
  frequency = "DAILY"
  
  monitor_arn_list = [
    aws_ce_anomaly_monitor.cost_monitor.arn
  ]
  
  subscriber {
    type    = "EMAIL"
    address = var.budget_notification_email
  }
}
```

## 9. Documentation and Runbooks

Comprehensive documentation and runbooks are essential for effective operations and incident response.

### Documentation Types

1. **Architecture Documentation**:
   - System architecture diagrams
   - Component interactions
   - Data flow diagrams
   - Security architecture

2. **Operational Documentation**:
   - Deployment procedures
   - Scaling procedures
   - Backup and restore procedures
   - Monitoring and alerting setup

3. **Runbooks**:
   - Incident response procedures
   - Common issue troubleshooting
   - Disaster recovery procedures
   - Maintenance procedures

### Sample Runbook: API Service Outage

```markdown
# Runbook: API Service Outage

## Symptoms
- API endpoints returning 5xx errors
- Increased error rate in CloudWatch metrics
- Alerts from monitoring system

## Initial Assessment

1. **Check Service Health**
   - Access the health check endpoint: `https://api.rapid-sentiment.jadekite.com/health/detailed`
   - Review CloudWatch dashboard for API metrics
   - Check recent deployments or changes

2. **Check Infrastructure Health**
   - Verify EC2 instances are running and healthy
   - Check load balancer health
   - Verify database connectivity
   - Check for AWS service issues

## Resolution Steps

### Scenario 1: High Load / Resource Exhaustion

1. **Increase Capacity**
   - Temporarily increase min/max capacity in Auto Scaling Group
   ```bash
   aws autoscaling update-auto-scaling-group \
     --auto-scaling-group-name api-asg \
     --min-size 4 \
     --max-size 12
   ```

2. **Check Database Connection Pool**
   - Verify connection pool settings
   - Check for connection leaks
   - Restart problematic instances if needed

### Scenario 2: Recent Deployment Issue

1. **Roll Back Deployment**
   - Identify the previous stable version
   ```bash
   aws deploy list-deployments \
     --application-name rapid-sentiment-api \
     --deployment-group-name rapid-sentiment-api-prod \
     --include-only-statuses Succeeded \
     --limit 5
   ```
   
   - Roll back to previous version
   ```bash
   aws deploy create-deployment \
     --application-name rapid-sentiment-api \
     --deployment-group-name rapid-sentiment-api-prod \
     --deployment-config-name CodeDeployDefault.AllAtOnce \
     --revision revisionType=S3,s3Location="{bucket=rapid-sentiment-deployments-prod,key=deployment-PREVIOUS_VERSION.zip,bundleType=zip}"
   ```

### Scenario 3: Database Issues

1. **Check Database Metrics**
   - CPU utilization
   - Memory usage
   - Connection count
   - Disk space

2. **Check for Long-Running Queries**
   ```sql
   SELECT pid, now() - pg_stat_activity.query_start AS duration, query
   FROM pg_stat_activity
   WHERE state = 'active' AND now() - pg_stat_activity.query_start > interval '5 minutes'
   ORDER BY duration DESC;
   ```

3. **Restart Database (if necessary)**
   ```bash
   aws rds reboot-db-instance --db-instance-identifier rapid-sentiment-db
   ```

### Scenario 4: Third-Party API Issues

1. **Check Third-Party API Status**
   - Verify Hume AI status
   - Verify Gemini API status

2. **Implement Fallback Mode**
   - Enable fallback mode in application configuration
   ```bash
   aws ssm put-parameter \
     --name "/rapid-sentiment/prod/ENABLE_FALLBACK_MODE" \
     --value "true" \
     --type "String" \
     --overwrite
   ```

## Post-Incident Actions

1. **Document the Incident**
   - Root cause analysis
   - Resolution steps taken
   - Time to resolution
   - Impact assessment

2. **Implement Preventive Measures**
   - Update monitoring thresholds
   - Add new alerts if needed
   - Improve automated recovery
   - Update runbooks with new information

3. **Conduct Post-Mortem Meeting**
   - Review incident timeline
   - Identify improvement areas
   - Assign action items
```

## 10. Implementation Timeline

The deployment and monitoring solution will be implemented in phases to ensure a smooth transition and minimize risk.

### Phase 1: Infrastructure Setup (Weeks 1-2)
1. Set up VPC, subnets, and security groups
2. Deploy database and Redis instances
3. Configure S3 buckets and IAM roles
4. Set up CI/CD pipeline

### Phase 2: Application Deployment (Weeks 3-4)
1. Deploy API servers and load balancers
2. Configure auto scaling
3. Set up Lambda functions
4. Implement blue-green deployment

### Phase 3: Monitoring and Alerting (Weeks 5-6)
1. Set up CloudWatch dashboards
2. Configure custom metrics
3. Implement alerting
4. Set up log aggregation

### Phase 4: Security and Compliance (Weeks 7-8)
1. Implement WAF and security headers
2. Configure encryption
3. Set up security monitoring
4. Conduct security assessment

### Phase 5: Disaster Recovery and Testing (Weeks 9-10)
1. Implement backup and restore procedures
2. Set up cross-region replication
3. Configure failover routing
4. Conduct disaster recovery testing

### Phase 6: Optimization and Documentation (Weeks 11-12)
1. Optimize resource utilization
2. Implement cost monitoring
3. Create documentation and runbooks
4. Conduct training sessions

## Conclusion

This comprehensive deployment and monitoring solution provides a robust, secure, and scalable infrastructure for the Rapid Consumer Sentiment Analysis service. By leveraging AWS services and following best practices for infrastructure as code, CI/CD, monitoring, security, and disaster recovery, the solution ensures high availability, performance, and cost-effectiveness.

The phased implementation approach allows for careful testing and validation at each stage, minimizing risk and ensuring a smooth transition to production. The detailed documentation and runbooks provide clear guidance for operations and incident response, enabling efficient management of the service.

With this solution in place, Jade Kite can confidently deliver the Rapid Consumer Sentiment Analysis service to clients, knowing that it is built on a solid foundation that can scale with demand and adapt to changing requirements.
