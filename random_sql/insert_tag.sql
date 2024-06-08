delete from [dbo].[tag_category];
delete from [dbo].[tag];
GO
DBCC CHECKIDENT ('[dbo].[tag_category]', RESEED, 0);
GO
DBCC CHECKIDENT ('[dbo].[tag]', RESEED, 0);
GO

insert into [dbo].[tag_category](name) Values ('język programowania'), ('technologia'), ('licencja');

insert into [dbo].[tag](name, tag_category_id) Values 
('C', 1), ('C++', 1), ('Java', 1), ('Rust', 1), ('JavaScript', 1), ('Lua', 1), ('Python', 1), ('PHP', 1), ('SQL', 1), ('Verilog', 1), ('VHDL', 1), 
('Node.js', 2), ('OpenGL', 2), ('Vulkan', 2), ('DirectX', 2), ('Microsoft SQL Server', 2), ('PostgreSQL', 2), 
('GNU GPL', 3), ('GNU LGPL', 3), ('MIT', 3), ('Apache-2.0', 3), ('BSD-3-Clause', 3), ('BSD-2-Clause', 3), ('Public domain', 3);

select * from [dbo].[tag_category];
select * from [dbo].[tag];