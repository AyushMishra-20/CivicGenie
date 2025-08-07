import { connectDatabase, disconnectDatabase } from '../config/database';
import { Complaint } from '../models/Complaint';

const migrateData = async () => {
  try {
    console.log('🔄 Starting database migration...');
    
    // Connect to database
    await connectDatabase();
    
    // Check if we have any existing data
    const existingComplaints = await Complaint.countDocuments();
    console.log(`📊 Found ${existingComplaints} existing complaints`);
    
    if (existingComplaints === 0) {
      console.log('📝 No existing data found. Database is ready for use.');
    } else {
      console.log('✅ Database already contains data. Migration complete.');
    }
    
    // Create indexes if they don't exist
    console.log('🔧 Ensuring database indexes...');
    await Complaint.createIndexes();
    console.log('✅ Database indexes created/verified');
    
    console.log('🎉 Database migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  migrateData();
}

export default migrateData; 