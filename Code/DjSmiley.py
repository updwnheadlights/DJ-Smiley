import discord
from discord.ext import commands, tasks
from discord.voice_client import VoiceClient
import youtube_dl
import asyncio
from random import choice
import queue

youtube_dl.utils.bug_reports_message = lambda: ''

ytdl_format_options = {
    'format': 'bestaudio/best',
    'outtmpl': '%(extractor)s-%(id)s-%(title)s.%(ext)s',
    'restrictfilenames': True,
    'noplaylist': True,
    'nocheckcertificate': True,
    'ignoreerrors': False,
    'logtostderr': False,
    'quiet': True,
    'no_warnings': True,
    'default_search': 'auto',
    'source_address': '0.0.0.0' # bind to ipv4 since ipv6 addresses cause issues sometimes
}

ffmpeg_options = {
    'options': '-vn'
}
ytdl = youtube_dl.YoutubeDL(ytdl_format_options)

class YTDLSource(discord.PCMVolumeTransformer):
    def __init__(self, source, *, data, volume=0.5):
        super().__init__(source, volume)

        self.data = data

        self.title = data.get('title')
        self.url = data.get('url')

    @classmethod
    async def from_url(cls, url, *, loop=None, stream=True):
        loop = loop or asyncio.get_event_loop()
        data = await loop.run_in_executor(None, lambda: ytdl.extract_info(url, download = False))
        
        if 'entries' in data:
            # take first item from a playlist
            data = data['entries'][0]

        filename = data['url'] if stream else ytdl.prepare_filename(data)
        return cls(discord.FFmpegPCMAudio(filename, **ffmpeg_options), data=data)

client = commands.Bot(command_prefix= '.')

status = ['Jamming Out To Music', 'Making Beats!', 'Sleeping!']
queue = []

@client.event
async def on_ready():
    change_status.start()
    print('DJ Smiley is online!')

@client.event
async def on_member_join(member):
    channel = discord.utils.get(member.guild.channels, name='general')
    await channel.send(f'Welcome {member.mention}!  Ready to jam out? See `?help` command for details!')

@client.command(name='ping', help='This Command Returns The Latency.')
async def ping(ctx):
    await ctx.send(f'**BAMM!** Latency: {round(client.latency *1000)}ms')

@client.command(name='hello', help='This Command Returns A Welcome Message' )
async def hello(ctx):
    responses = ['Hello How Can I Help You?', 'What Is It That You Desire?','Your Word Is My Command!']
    await ctx.send(choice(responses))

@client.command(name='credits', help='This Command Returns Info About My Creator ')
async def credits(ctx):
    await ctx.send('Made By `Ayush Desai`')
    await ctx.send('Find Me On Github `@updwnheadlights`')
    await ctx.send('Fun Fact: This Is My First Discord Bot')

@client.command(name='join', help='This Command Makes DJ Smiley Join The Voice Chat!')
async def join(ctx):
    if not ctx.message.author.voice:
        await ctx.send("You are not connected to a voice channel")
        return
    
    else:
        channel = ctx.message.author.voice.channel

    await channel.connect()

@client.command(name='leave', help='This Command Makes DJ Smiley Leave!')
async def stop(ctx):
    voice_client = ctx.message.guild.voice_client
    await voice_client.disconnect()

@client.command(name='play', help='This command plays music')
async def play(ctx, *args):
    server = ctx.message.guild
    voice_channel = server.voice_client
    url = ""
    for word in args:
        url += word
        url += ' '
    async with ctx.typing():
        player = await YTDLSource.from_url(url, loop= client.loop)
        voice_channel.play(player, after=lambda e: print('player error: %s' %e) if e else None)
    await ctx.send(f'*Now playing:* {player.title}')


@client.command(name='volume', help='This command Changes the Music Volume ')
async def volume(ctx, volume: int):
    if ctx.voice_client is None:
        return await ctx.send("You Are Not Connected To A Voice Channel.")

    ctx.voice_client.source.volume = volume/100
    await ctx.send(f"Changed The Volume To {volume}%")


@client.command(name='pause', help='This Command Pauses The Music') 
async def pause(ctx):
    server = ctx.message.guild
    voice_channel = server.voice_client
    
    voice_channel.pause()

@client.command(name='resume', help="This Command Resumes The Music!")
async def resume(ctx):
    server = ctx.message.guild
    voice_channel = server.voice_client    
    
    voice_channel.resume()
    
@client.command(name='queue', help='This command adds a song to the queue')
async def queue_(ctx, *url):
    global queue

    queue.append(url)
    await ctx.send(f'`{url}` added to queue!')

@client.command(name='remove')
async def remove(ctx,number):
    global queue 
    
    try:
        del(queue[int(number)])
        await ctx.send(f'Your Queue is now `{queue}!`')
        
    except:
        await ctx.send('Your Queue is either **Empty** or The Index is **Out Of Range**')
    
@client.command(name='view', help='This Command Shows The Queue')    
async def view(ctx):
    await ctx.send(f'Your Queue is now `{queue}!`')
    
@client.command(name='dm')
async def dm(ctx):
    await ctx.author.send('What Can I Do For You Master?')

@tasks.loop(seconds=20)
async def change_status():
    await client.change_presence(activity=discord.Game(choice(status)))

client.run('token')
