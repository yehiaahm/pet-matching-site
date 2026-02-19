-- ============================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================
-- These indexes are automatically created by Prisma
-- but this file documents them for reference

-- ============================================
-- USERS TABLE INDEXES
-- ============================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_verified ON users(isVerified);
CREATE INDEX idx_users_created ON users(createdAt);
CREATE INDEX idx_users_city ON users(city);

-- ============================================
-- PETS TABLE INDEXES
-- ============================================
CREATE INDEX idx_pets_owner ON pets(ownerId);
CREATE INDEX idx_pets_species ON pets(species);
CREATE INDEX idx_pets_breed ON pets(breed);
CREATE INDEX idx_pets_gender ON pets(gender);
CREATE INDEX idx_pets_breeding_status ON pets(breedingStatus);
CREATE INDEX idx_pets_published ON pets(isPublished);
CREATE INDEX idx_pets_created ON pets(createdAt);

-- Composite indexes for common search patterns
CREATE INDEX idx_pets_species_breed ON pets(species, breed);
CREATE INDEX idx_pets_species_gender ON pets(species, gender);
CREATE INDEX idx_pets_breed_gender ON pets(breed, gender);
CREATE INDEX idx_pets_species_breed_gender ON pets(species, breed, gender);

-- Unique indexes for documentation fields
CREATE UNIQUE INDEX idx_pet_pedigree ON pets(pedigreeNumber) 
WHERE pedigreeNumber IS NOT NULL;
CREATE UNIQUE INDEX idx_pet_registration ON pets(registrationNumber) 
WHERE registrationNumber IS NOT NULL;
CREATE UNIQUE INDEX idx_pet_microchip ON pets(microchipNumber) 
WHERE microchipNumber IS NOT NULL;

-- ============================================
-- BREEDING_REQUESTS TABLE INDEXES
-- ============================================
CREATE INDEX idx_breeding_req_initiator ON breeding_requests(initiatorId);
CREATE INDEX idx_breeding_req_target ON breeding_requests(targetUserId);
CREATE INDEX idx_breeding_req_initiator_pet ON breeding_requests(initiatorPetId);
CREATE INDEX idx_breeding_req_target_pet ON breeding_requests(targetPetId);
CREATE INDEX idx_breeding_req_status ON breeding_requests(status);
CREATE INDEX idx_breeding_req_created ON breeding_requests(createdAt);

-- Unique constraint for preventing duplicate requests
CREATE UNIQUE INDEX idx_breeding_req_unique ON breeding_requests(
  initiatorId, initiatorPetId, targetUserId, targetPetId
);

-- ============================================
-- MATCHES TABLE INDEXES
-- ============================================
CREATE INDEX idx_match_breeding_req ON matches(breedingRequestId);
CREATE INDEX idx_match_initiator_pet ON matches(initiatorPetId);
CREATE INDEX idx_match_target_pet ON matches(targetPetId);
CREATE INDEX idx_match_status ON matches(status);
CREATE INDEX idx_match_scheduled_date ON matches(scheduledDate);
CREATE INDEX idx_match_completed_date ON matches(completedDate);

-- ============================================
-- MESSAGES TABLE INDEXES
-- ============================================
CREATE INDEX idx_message_sender ON messages(senderId);
CREATE INDEX idx_message_recipient ON messages(recipientId);
CREATE INDEX idx_message_breeding_req ON messages(breedingRequestId);
CREATE INDEX idx_message_status ON messages(status);
CREATE INDEX idx_message_is_read ON messages(isRead);
CREATE INDEX idx_message_created ON messages(createdAt);

-- Composite index for message inbox queries
CREATE INDEX idx_message_recipient_created ON messages(recipientId, createdAt DESC);
CREATE INDEX idx_message_sender_created ON messages(senderId, createdAt DESC);

-- ============================================
-- REVIEWS TABLE INDEXES
-- ============================================
CREATE INDEX idx_review_reviewer ON reviews(reviewerId);
CREATE INDEX idx_review_reviewee ON reviews(revieweeId);
CREATE INDEX idx_review_breeding_req ON reviews(breedingRequestId);
CREATE INDEX idx_review_rating ON reviews(rating);
CREATE INDEX idx_review_created ON reviews(createdAt);

-- Unique constraint for one review per request per reviewer
CREATE UNIQUE INDEX idx_review_unique ON reviews(reviewerId, breedingRequestId);

-- ============================================
-- HEALTH_RECORDS TABLE INDEXES
-- ============================================
CREATE INDEX idx_health_record_pet ON health_records(petId);
CREATE INDEX idx_health_record_type ON health_records(recordType);
CREATE INDEX idx_health_record_date ON health_records(recordDate DESC);

-- ============================================
-- CERTIFICATIONS TABLE INDEXES
-- ============================================
CREATE INDEX idx_certification_pet ON certifications(petId);
CREATE INDEX idx_certification_type ON certifications(type);
CREATE INDEX idx_certification_status ON certifications(verificationStatus);
CREATE INDEX idx_certification_expiry ON certifications(expiryDate);

-- ============================================
-- GENETIC_TESTS TABLE INDEXES
-- ============================================
CREATE INDEX idx_genetic_test_pet ON genetic_tests(petId);
CREATE INDEX idx_genetic_test_date ON genetic_tests(testDate DESC);
CREATE INDEX idx_genetic_test_status ON genetic_tests(status);

-- ============================================
-- REFRESH_TOKENS TABLE INDEXES
-- ============================================
CREATE INDEX idx_refresh_token_user ON refresh_tokens(userId);
CREATE INDEX idx_refresh_token_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_token_expires ON refresh_tokens(expiresAt);

-- ============================================
-- ADVANCED QUERY INDEXES
-- ============================================

-- For finding available pets by location and breed
CREATE INDEX idx_pets_available_search ON pets(
  isPublished, breedingStatus, species, breed
) WHERE isPublished = true AND breedingStatus = 'AVAILABLE';

-- For user reputation queries
CREATE INDEX idx_users_rating ON users(rating DESC) 
WHERE role = 'BREEDER';

-- For finding recent matches
CREATE INDEX idx_matches_recent ON matches(status, createdAt DESC) 
WHERE status != 'CANCELLED';

-- For message conversations
CREATE INDEX idx_message_conversation ON messages(senderId, recipientId, createdAt DESC);

-- ============================================
-- PARTIAL INDEXES (for nullable columns)
-- ============================================

-- Only index non-deleted users
CREATE INDEX idx_users_active ON users(id) 
WHERE deletedAt IS NULL;

-- Only index active pets
CREATE INDEX idx_pets_active ON pets(id) 
WHERE isActive = true AND deletedAt IS NULL;

-- Only index pending requests
CREATE INDEX idx_breeding_req_pending ON breeding_requests(id) 
WHERE status = 'PENDING';

-- Only index unread messages
CREATE INDEX idx_messages_unread ON messages(recipientId, createdAt DESC) 
WHERE isRead = false;

-- ============================================
-- PERFORMANCE MONITORING QUERIES
-- ============================================

-- Check index usage statistics
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
-- FROM pg_stat_user_indexes
-- ORDER BY idx_scan DESC;

-- Check table size
-- SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check missing indexes
-- SELECT schemaname, tablename, attname, n_distinct, correlation
-- FROM pg_stats
-- WHERE schemaname = 'public'
-- ORDER BY abs(correlation) DESC;

-- ============================================
-- VACUUM & MAINTENANCE
-- ============================================

-- Analyze tables to update statistics
-- ANALYZE users;
-- ANALYZE pets;
-- ANALYZE breeding_requests;
-- ANALYZE matches;
-- ANALYZE messages;
-- ANALYZE reviews;

-- Vacuum to reclaim space (run periodically)
-- VACUUM ANALYZE;

-- Reindex tables (run periodically)
-- REINDEX TABLE users;
-- REINDEX TABLE pets;
-- REINDEX TABLE breeding_requests;
