package com.orchard.orchard_store_backend.config;

import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Cấu hình MinIO (S3 Compatible) cho Spring Boot
 * 
 * MinIO yêu cầu:
 * - Path-style access: true (bắt buộc)
 * - Endpoint configuration với custom endpoint
 * - Basic credentials (access-key, secret-key)
 */
@Configuration
public class S3Config {

    @Value("${cloud.aws.s3.endpoint}")
    private String s3Endpoint;

    @Value("${cloud.aws.credentials.access-key}")
    private String accessKey;

    @Value("${cloud.aws.credentials.secret-key}")
    private String secretKey;

    @Value("${cloud.aws.region.static}")
    private String region;

    /**
     * Tạo AmazonS3 client bean để kết nối với MinIO
     * 
     * Quan trọng:
     * - withPathStyleAccessEnabled(true): Bắt buộc cho MinIO
     * - EndpointConfiguration: Chỉ định endpoint của MinIO (không phải AWS S3)
     * - BasicAWSCredentials: Sử dụng access-key và secret-key từ MinIO
     * 
     * @return AmazonS3 client instance
     */
    @Bean
    public AmazonS3 amazonS3() {
        // Tạo credentials từ access-key và secret-key
        AWSCredentials credentials = new BasicAWSCredentials(accessKey, secretKey);

        // Cấu hình endpoint cho MinIO
        AwsClientBuilder.EndpointConfiguration endpointConfiguration =
                new AwsClientBuilder.EndpointConfiguration(s3Endpoint, region);

        // Tạo và cấu hình AmazonS3 client
        return AmazonS3ClientBuilder
                .standard()
                .withEndpointConfiguration(endpointConfiguration)
                .withPathStyleAccessEnabled(true) // ⚠️ QUAN TRỌNG: Bắt buộc cho MinIO
                .withCredentials(new AWSStaticCredentialsProvider(credentials))
                .build();
    }
}

