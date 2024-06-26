/****** Object:  Database [aghioprj-db]    Script Date: 17/06/2024 04:00:23 ******/
CREATE DATABASE [aghioprj-db]  (EDITION = 'GeneralPurpose', SERVICE_OBJECTIVE = 'GP_S_Gen5_1', MAXSIZE = 32 GB) WITH CATALOG_COLLATION = SQL_Latin1_General_CP1_CI_AS, LEDGER = OFF;
GO
ALTER DATABASE [aghioprj-db] SET COMPATIBILITY_LEVEL = 150
GO
ALTER DATABASE [aghioprj-db] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [aghioprj-db] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [aghioprj-db] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [aghioprj-db] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [aghioprj-db] SET ARITHABORT OFF 
GO
ALTER DATABASE [aghioprj-db] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [aghioprj-db] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [aghioprj-db] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [aghioprj-db] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [aghioprj-db] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [aghioprj-db] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [aghioprj-db] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [aghioprj-db] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [aghioprj-db] SET ALLOW_SNAPSHOT_ISOLATION ON 
GO
ALTER DATABASE [aghioprj-db] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [aghioprj-db] SET READ_COMMITTED_SNAPSHOT ON 
GO
ALTER DATABASE [aghioprj-db] SET  MULTI_USER 
GO
ALTER DATABASE [aghioprj-db] SET ENCRYPTION ON
GO
ALTER DATABASE [aghioprj-db] SET QUERY_STORE = ON
GO
ALTER DATABASE [aghioprj-db] SET QUERY_STORE (OPERATION_MODE = READ_WRITE, CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30), DATA_FLUSH_INTERVAL_SECONDS = 900, INTERVAL_LENGTH_MINUTES = 60, MAX_STORAGE_SIZE_MB = 100, QUERY_CAPTURE_MODE = AUTO, SIZE_BASED_CLEANUP_MODE = AUTO, MAX_PLANS_PER_QUERY = 200, WAIT_STATS_CAPTURE_MODE = ON)
GO
/*** The scripts of database scoped configurations in Azure should be executed inside the target database connection. ***/
GO
-- ALTER DATABASE SCOPED CONFIGURATION SET MAXDOP = 8;
GO
/****** Object:  Table [dbo].[message]    Script Date: 17/06/2024 04:00:23 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[message](
	[message_id] [bigint] IDENTITY(1,1) NOT NULL,
	[message_room_id] [int] NOT NULL,
	[user_id] [bigint] NOT NULL,
	[text] [nvarchar](1024) NOT NULL,
	[create_date] [datetime] NOT NULL,
 CONSTRAINT [PK_message] PRIMARY KEY CLUSTERED 
(
	[message_id] ASC,
	[message_room_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[message_room]    Script Date: 17/06/2024 04:00:23 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[message_room](
	[message_room_id] [int] IDENTITY(1,1) NOT NULL,
	[public] [bit] NOT NULL,
 CONSTRAINT [PK_message_room] PRIMARY KEY CLUSTERED 
(
	[message_room_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[message_room_access]    Script Date: 17/06/2024 04:00:23 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[message_room_access](
	[message_room_id] [int] NOT NULL,
	[user_id] [bigint] NOT NULL,
 CONSTRAINT [PK_message_room_access] PRIMARY KEY CLUSTERED 
(
	[message_room_id] ASC,
	[user_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[notification]    Script Date: 17/06/2024 04:00:23 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[notification](
	[notification_id] [bigint] IDENTITY(1,1) NOT NULL,
	[notification_type_id] [int] NOT NULL,
	[user_id] [bigint] NOT NULL,
	[create_date] [datetime] NOT NULL,
	[seen] [bit] NOT NULL,
	[from_user_id] [bigint] NULL,
	[from_project_id] [bigint] NULL,
	[message] [nvarchar](256) NULL,
 CONSTRAINT [PK_notification] PRIMARY KEY CLUSTERED 
(
	[notification_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[notification_type]    Script Date: 17/06/2024 04:00:23 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[notification_type](
	[notification_type_id] [int] IDENTITY(1,1) NOT NULL,
	[name] [nvarchar](64) NOT NULL,
 CONSTRAINT [PK_notification_type] PRIMARY KEY CLUSTERED 
(
	[notification_type_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[project]    Script Date: 17/06/2024 04:00:23 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[project](
	[project_id] [bigint] IDENTITY(1,1) NOT NULL,
	[create_date] [datetime] NOT NULL,
	[update_date] [datetime] NULL,
	[closed] [bit] NOT NULL,
	[title] [nvarchar](max) NULL,
	[description] [nvarchar](max) NULL,
	[public_message_room_id] [int] NOT NULL,
	[private_message_room_id] [int] NOT NULL,
 CONSTRAINT [PK_post] PRIMARY KEY CLUSTERED 
(
	[project_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[project_interaction]    Script Date: 17/06/2024 04:00:23 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[project_interaction](
	[project_interaction_id] [bigint] IDENTITY(1,1) NOT NULL,
	[project_id] [bigint] NOT NULL,
	[user_id] [bigint] NOT NULL,
	[like] [bit] NOT NULL,
	[follow] [bit] NOT NULL,
 CONSTRAINT [PK_project_interaction] PRIMARY KEY CLUSTERED 
(
	[project_interaction_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[project_member]    Script Date: 17/06/2024 04:00:23 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[project_member](
	[project_member_id] [bigint] IDENTITY(1,1) NOT NULL,
	[project_id] [bigint] NOT NULL,
	[user_id] [bigint] NOT NULL,
	[join_date] [datetime] NOT NULL,
	[creator] [bit] NOT NULL,
	[accepted] [bit] NOT NULL,
	[baned] [bit] NOT NULL,
 CONSTRAINT [PK_project_member] PRIMARY KEY CLUSTERED 
(
	[project_member_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[project_tag]    Script Date: 17/06/2024 04:00:23 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[project_tag](
	[project_tag_id] [bigint] IDENTITY(1,1) NOT NULL,
	[project_id] [bigint] NOT NULL,
	[tag_id] [int] NOT NULL,
 CONSTRAINT [PK_project_tag] PRIMARY KEY CLUSTERED 
(
	[project_tag_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tag]    Script Date: 17/06/2024 04:00:23 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tag](
	[tag_id] [int] IDENTITY(1,1) NOT NULL,
	[name] [nvarchar](128) NOT NULL,
	[tag_category_id] [int] NULL,
 CONSTRAINT [PK_tag] PRIMARY KEY CLUSTERED 
(
	[tag_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tag_category]    Script Date: 17/06/2024 04:00:23 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tag_category](
	[tag_category_id] [int] IDENTITY(1,1) NOT NULL,
	[name] [nvarchar](128) NOT NULL,
 CONSTRAINT [PK_tag_category] PRIMARY KEY CLUSTERED 
(
	[tag_category_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[user]    Script Date: 17/06/2024 04:00:23 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[user](
	[user_id] [bigint] IDENTITY(1,1) NOT NULL,
	[email] [nchar](255) NOT NULL,
	[pass] [nchar](255) NOT NULL,
	[name] [nchar](255) NOT NULL,
	[is_admin] [bit] NOT NULL,
	[birth_date] [date] NOT NULL,
	[join_date] [datetime] NOT NULL,
	[gender] [nchar](16) NULL,
	[picture] [image] NULL,
 CONSTRAINT [PK_user] PRIMARY KEY CLUSTERED 
(
	[user_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [unique_email] UNIQUE NONCLUSTERED 
(
	[email] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [unique_name] UNIQUE NONCLUSTERED 
(
	[name] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
ALTER TABLE [dbo].[message] ADD  CONSTRAINT [DF_message_create_date]  DEFAULT (getutcdate()) FOR [create_date]
GO
ALTER TABLE [dbo].[notification] ADD  CONSTRAINT [DF_notification_create_date]  DEFAULT (getutcdate()) FOR [create_date]
GO
ALTER TABLE [dbo].[notification] ADD  CONSTRAINT [DF_notification_seen]  DEFAULT ((0)) FOR [seen]
GO
ALTER TABLE [dbo].[project] ADD  CONSTRAINT [DF_post_create_date]  DEFAULT (getutcdate()) FOR [create_date]
GO
ALTER TABLE [dbo].[project] ADD  CONSTRAINT [DF_project_closed]  DEFAULT ((0)) FOR [closed]
GO
ALTER TABLE [dbo].[project_member] ADD  CONSTRAINT [DF_project_member_join_date]  DEFAULT (getutcdate()) FOR [join_date]
GO
ALTER TABLE [dbo].[project_member] ADD  CONSTRAINT [DF_project_member_creator]  DEFAULT ((0)) FOR [creator]
GO
ALTER TABLE [dbo].[project_member] ADD  CONSTRAINT [DF_project_member_accepted]  DEFAULT ((0)) FOR [accepted]
GO
ALTER TABLE [dbo].[project_member] ADD  CONSTRAINT [DF_project_member_baned]  DEFAULT ((0)) FOR [baned]
GO
ALTER TABLE [dbo].[user] ADD  CONSTRAINT [DF_user_is_admin]  DEFAULT ((0)) FOR [is_admin]
GO
ALTER TABLE [dbo].[user] ADD  CONSTRAINT [DF_user_join_date]  DEFAULT (getutcdate()) FOR [join_date]
GO
ALTER TABLE [dbo].[message]  WITH CHECK ADD  CONSTRAINT [FK_message_message_room] FOREIGN KEY([message_room_id])
REFERENCES [dbo].[message_room] ([message_room_id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[message] CHECK CONSTRAINT [FK_message_message_room]
GO
ALTER TABLE [dbo].[message_room_access]  WITH CHECK ADD  CONSTRAINT [FK_message_room_access_message_room] FOREIGN KEY([message_room_id])
REFERENCES [dbo].[message_room] ([message_room_id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[message_room_access] CHECK CONSTRAINT [FK_message_room_access_message_room]
GO
ALTER TABLE [dbo].[message_room_access]  WITH CHECK ADD  CONSTRAINT [FK_message_room_access_user] FOREIGN KEY([user_id])
REFERENCES [dbo].[user] ([user_id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[message_room_access] CHECK CONSTRAINT [FK_message_room_access_user]
GO
ALTER TABLE [dbo].[notification]  WITH CHECK ADD  CONSTRAINT [FK_notification_notification_type] FOREIGN KEY([notification_type_id])
REFERENCES [dbo].[notification_type] ([notification_type_id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[notification] CHECK CONSTRAINT [FK_notification_notification_type]
GO
ALTER TABLE [dbo].[notification]  WITH CHECK ADD  CONSTRAINT [FK_notification_project] FOREIGN KEY([from_project_id])
REFERENCES [dbo].[project] ([project_id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[notification] CHECK CONSTRAINT [FK_notification_project]
GO
ALTER TABLE [dbo].[notification]  WITH CHECK ADD  CONSTRAINT [FK_notification_user] FOREIGN KEY([user_id])
REFERENCES [dbo].[user] ([user_id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[notification] CHECK CONSTRAINT [FK_notification_user]
GO
ALTER TABLE [dbo].[notification]  WITH CHECK ADD  CONSTRAINT [FK_notification_user1] FOREIGN KEY([from_user_id])
REFERENCES [dbo].[user] ([user_id])
GO
ALTER TABLE [dbo].[notification] CHECK CONSTRAINT [FK_notification_user1]
GO
ALTER TABLE [dbo].[project]  WITH CHECK ADD  CONSTRAINT [FK_project_message_room] FOREIGN KEY([public_message_room_id])
REFERENCES [dbo].[message_room] ([message_room_id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[project] CHECK CONSTRAINT [FK_project_message_room]
GO
ALTER TABLE [dbo].[project]  WITH CHECK ADD  CONSTRAINT [FK_project_message_room1] FOREIGN KEY([private_message_room_id])
REFERENCES [dbo].[message_room] ([message_room_id])
GO
ALTER TABLE [dbo].[project] CHECK CONSTRAINT [FK_project_message_room1]
GO
ALTER TABLE [dbo].[project_interaction]  WITH CHECK ADD  CONSTRAINT [FK_project_interaction_project] FOREIGN KEY([project_id])
REFERENCES [dbo].[project] ([project_id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[project_interaction] CHECK CONSTRAINT [FK_project_interaction_project]
GO
ALTER TABLE [dbo].[project_interaction]  WITH CHECK ADD  CONSTRAINT [FK_project_interaction_user] FOREIGN KEY([user_id])
REFERENCES [dbo].[user] ([user_id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[project_interaction] CHECK CONSTRAINT [FK_project_interaction_user]
GO
ALTER TABLE [dbo].[project_member]  WITH CHECK ADD  CONSTRAINT [FK_project_member_project] FOREIGN KEY([project_id])
REFERENCES [dbo].[project] ([project_id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[project_member] CHECK CONSTRAINT [FK_project_member_project]
GO
ALTER TABLE [dbo].[project_member]  WITH CHECK ADD  CONSTRAINT [FK_project_member_user] FOREIGN KEY([user_id])
REFERENCES [dbo].[user] ([user_id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[project_member] CHECK CONSTRAINT [FK_project_member_user]
GO
ALTER TABLE [dbo].[project_tag]  WITH NOCHECK ADD  CONSTRAINT [FK_project_tag_project] FOREIGN KEY([project_id])
REFERENCES [dbo].[project] ([project_id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[project_tag] CHECK CONSTRAINT [FK_project_tag_project]
GO
ALTER TABLE [dbo].[project_tag]  WITH NOCHECK ADD  CONSTRAINT [FK_project_tag_tag] FOREIGN KEY([tag_id])
REFERENCES [dbo].[tag] ([tag_id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[project_tag] CHECK CONSTRAINT [FK_project_tag_tag]
GO
ALTER TABLE [dbo].[tag]  WITH CHECK ADD  CONSTRAINT [FK_tag_tag_category] FOREIGN KEY([tag_category_id])
REFERENCES [dbo].[tag_category] ([tag_category_id])
ON DELETE SET NULL
GO
ALTER TABLE [dbo].[tag] CHECK CONSTRAINT [FK_tag_tag_category]
GO
ALTER TABLE [dbo].[user]  WITH CHECK ADD  CONSTRAINT [email_len] CHECK  ((len([email])>=(8)))
GO
ALTER TABLE [dbo].[user] CHECK CONSTRAINT [email_len]
GO
ALTER TABLE [dbo].[user]  WITH CHECK ADD  CONSTRAINT [name_len] CHECK  ((len([name])>=(8)))
GO
ALTER TABLE [dbo].[user] CHECK CONSTRAINT [name_len]
GO
ALTER TABLE [dbo].[user]  WITH CHECK ADD  CONSTRAINT [pass_len] CHECK  ((len([pass])>=(8)))
GO
ALTER TABLE [dbo].[user] CHECK CONSTRAINT [pass_len]
GO
ALTER TABLE [dbo].[user]  WITH CHECK ADD  CONSTRAINT [user_age] CHECK  ((datediff(year,[birth_date],getutcdate())>=(16)))
GO
ALTER TABLE [dbo].[user] CHECK CONSTRAINT [user_age]
GO
ALTER DATABASE [aghioprj-db] SET  READ_WRITE 
GO
