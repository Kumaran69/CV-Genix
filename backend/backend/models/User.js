// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true
  },
  email: { 
    type: String, 
    unique: true,
    sparse: true, // Allows multiple null values for GitHub users
    lowercase: true,
    trim: true,
    // Make email not required for GitHub OAuth users
    validate: {
      validator: function(v) {
        // If no GitHub ID, email is required
        if (!this.githubId) {
          return v && v.length > 0;
        }
        return true;
      },
      message: "Email is required for non-GitHub users"
    }
  },
  password: {
    type: String,
    // Make password not required for GitHub OAuth users
    validate: {
      validator: function(v) {
        // If no GitHub ID, password is required
        if (!this.githubId) {
          return v && v.length >= 6;
        }
        return true;
      },
      message: "Password must be at least 6 characters for non-GitHub users"
    }
  },
  // GitHub OAuth fields
  githubId: {
    type: String,
    unique: true,
    sparse: true // Allows multiple null values
  },
  githubUsername: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    trim: true
  },
  // User role (optional - for future features)
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  // User verification status
  isVerified: {
    type: Boolean,
    default: false
  },
  // OAuth provider
  provider: {
    type: String,
    enum: ["local", "github", "google"],
    default: "local"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp on save
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Set provider based on auth method
  if (this.githubId && !this.provider) {
    this.provider = "github";
  }
  
  // Set default name if not provided for GitHub users
  if (this.githubId && (!this.name || this.name.trim() === "")) {
    this.name = this.githubUsername || "GitHub User";
  }
  
  next();
});

// Remove password when converting to JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Static method to find or create GitHub user
userSchema.statics.findOrCreateGitHubUser = async function(githubData) {
  const { id, login, email, avatar_url, name } = githubData;
  
  // Try to find by GitHub ID first
  let user = await this.findOne({ githubId: id.toString() });
  
  if (user) {
    // Update existing GitHub user
    user.githubUsername = login;
    user.avatar = avatar_url;
    if (name) user.name = name;
    if (email) user.email = email;
    
    await user.save();
    return user;
  }
  
  // If not found by GitHub ID, try by email
  if (email) {
    user = await this.findOne({ email: email.toLowerCase() });
    
    if (user) {
      // Link GitHub account to existing user
      user.githubId = id.toString();
      user.githubUsername = login;
      user.avatar = avatar_url;
      if (name) user.name = name;
      
      await user.save();
      return user;
    }
  }
  
  // Create new user
  user = new this({
    name: name || login,
    email: email || `${login}@github.user`,
    githubId: id.toString(),
    githubUsername: login,
    avatar: avatar_url,
    provider: "github",
    isVerified: true // GitHub users are considered verified
  });
  
  await user.save();
  return user;
};

// Instance method to check if user has password
userSchema.methods.hasPassword = function() {
  return !!this.password && this.password.length > 0;
};

// Instance method to check if user is GitHub user
userSchema.methods.isGitHubUser = function() {
  return !!this.githubId;
};

export default mongoose.model("User", userSchema);