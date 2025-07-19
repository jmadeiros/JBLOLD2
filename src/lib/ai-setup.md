# AI Analysis Setup

## Quick Setup (Choose One)

### Option 1: OpenAI (Recommended)
1. Get API key from https://platform.openai.com/api-keys
2. Create `.env.local` file in project root:
```
OPENAI_API_KEY=sk-your-key-here
NODE_ENV=production
```

### Option 2: Anthropic Claude
1. Get API key from https://console.anthropic.com/
2. Create `.env.local` file:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
AI_PROVIDER=anthropic
NODE_ENV=production
```

### Option 3: Azure OpenAI
1. Set up Azure OpenAI resource
2. Create `.env.local` file:
```
AZURE_OPENAI_API_KEY=your-key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_MODEL=gpt-4
AI_PROVIDER=azure
NODE_ENV=production
```

## Testing
1. Upload a construction program file (.xlsx, .mpp)
2. Should see "Analyzing program..." with orange icon
3. Results appear with trade tasks and admin items

## Current Status
- **Development Mode**: Uses mock analysis (what you're seeing now)
- **Production Mode**: Uses real AI when environment variables are set 