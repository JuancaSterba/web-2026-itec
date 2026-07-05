-- Baseline generado por Hibernate schema-export
-- (spring.jpa.properties.jakarta.persistence.schema-generation.scripts.action=create)
-- contra el modelo ya unificado (User.legajo, sin unique en telefono, Alumno
-- sin legajo propio). Ver docs/superpowers/specs/2026-07-05-unificacion-actores-flyway-design.md

create table alumno (activo bit not null, id bigint not null auto_increment, user_id bigint, primary key (id)) engine=InnoDB;
create table alumno_carrera (anio_ingreso integer, alumno_id bigint, carrera_id bigint, id bigint not null auto_increment, plan_estudio_id bigint, primary key (id)) engine=InnoDB;
create table alumno_inscripto (nota_final float(53), alumno_carrera_id bigint, comision_id bigint, id bigint not null auto_increment, estado enum ('REGULAR','APROBADO','RECURSA'), primary key (id)) engine=InnoDB;
create table asistencia (fecha date, presente bit not null, alumno_inscripto_id bigint, horario_id bigint, id bigint not null auto_increment, primary key (id)) engine=InnoDB;
create table carrera (activa bit not null, id bigint not null auto_increment, descripcion varchar(255), nombre varchar(255), resolucion varchar(255), primary key (id)) engine=InnoDB;
create table comision_materia (activa bit not null, cupo integer, cuatrimestre_id bigint, id bigint not null auto_increment, materia_id bigint, profesor_id bigint, nombre varchar(255), primary key (id)) engine=InnoDB;
create table correlativas (correlativa_id bigint not null, materia_id bigint not null) engine=InnoDB;
create table cuatrimestre (actual bit not null, anio integer, fecha_fin date, fecha_inicio date, numero integer, id bigint not null auto_increment, primary key (id)) engine=InnoDB;
create table examen (fecha date, comision_id bigint, id bigint not null auto_increment, descripcion varchar(255), tipo enum ('TP','PARCIAL','RECUPERATORIO','FINAL'), primary key (id)) engine=InnoDB;
create table horario_modulos (horario_id bigint not null, modulo_id bigint not null) engine=InnoDB;
create table horario_clase (comision_id bigint, id bigint not null auto_increment, dia_semana enum ('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'), primary key (id)) engine=InnoDB;
create table materia (activa bit not null, anio integer, carga_horaria integer, cuatrimestre integer, id bigint not null auto_increment, plan_estudio_id bigint, nombre varchar(255), primary key (id)) engine=InnoDB;
create table modulo_horario (hora_fin time(6), hora_inicio time(6), numero integer not null, id bigint not null auto_increment, primary key (id)) engine=InnoDB;
create table nota (valor float(53), alumno_inscripto_id bigint, examen_id bigint, id bigint not null auto_increment, primary key (id)) engine=InnoDB;
create table plan_estudio (activo bit not null, fecha_fin date, fecha_inicio date, carrera_id bigint, id bigint not null auto_increment, resolucion varchar(255), validez varchar(255), primary key (id)) engine=InnoDB;
create table profesor (activo bit not null, id bigint not null auto_increment, user_id bigint, titulo varchar(255), primary key (id)) engine=InnoDB;
create table user_roles (user_id bigint not null, role enum ('ADMIN','ADMINISTRATIVO','PROFESOR','ALUMNO')) engine=InnoDB;
create table usuarios (enabled boolean default true not null, id bigint not null auto_increment, apellido varchar(255), dni varchar(255), email varchar(255), legajo varchar(255), nombre varchar(255), password varchar(255), telefono varchar(255), telefono_secundario varchar(255), username varchar(255), primary key (id)) engine=InnoDB;

alter table alumno add constraint UK_ewudr5xddooypw6oglteebr6l unique (user_id);
alter table profesor add constraint UK_huqvajnvp7byjcmj6x992g9ee unique (user_id);
alter table usuarios add constraint UKm2dvbwfge291euvmk6vkkocao unique (username);
alter table usuarios add constraint UKggd9d47p8x7m0ajavk1ayuyqs unique (dni);
alter table usuarios add constraint UKkfsp0s1tflm1cwlj8idhqsad0 unique (email);
alter table usuarios add constraint UK_hhq86mhoqaolr7bcdgsfln3ls unique (legajo);

alter table alumno add constraint FKinhci4b8ajax123tmidgyfwr8 foreign key (user_id) references usuarios (id);
alter table alumno_carrera add constraint FK5wyea2b1pl2dxx4gvfclv2gl8 foreign key (alumno_id) references alumno (id);
alter table alumno_carrera add constraint FK4xlft2arld0utc99h88uthprb foreign key (carrera_id) references carrera (id);
alter table alumno_carrera add constraint FKjbkuav22w0trbcfouu7ws5e0u foreign key (plan_estudio_id) references plan_estudio (id);
alter table alumno_inscripto add constraint FKxf8qkxpv0l9txurpwh4tk6hw foreign key (alumno_carrera_id) references alumno_carrera (id);
alter table alumno_inscripto add constraint FKid4uygn1v885jvrxs9lbcrbca foreign key (comision_id) references comision_materia (id);
alter table asistencia add constraint FKf7441s0ykhlurkkbgva88xefo foreign key (horario_id) references horario_clase (id);
alter table asistencia add constraint FKtlj0mjebgqrjaitk1qdrfymp8 foreign key (alumno_inscripto_id) references alumno_inscripto (id);
alter table comision_materia add constraint FKoolpcp3f4g59edo405h8vgtaq foreign key (cuatrimestre_id) references cuatrimestre (id);
alter table comision_materia add constraint FKca3x5ccp5r0jcim4s51y0v46v foreign key (materia_id) references materia (id);
alter table comision_materia add constraint FKk67ft1yswll2id4hn5u3q4gij foreign key (profesor_id) references profesor (id);
alter table correlativas add constraint FKhsdv2f5v54yk2k4lwu4st9gmf foreign key (correlativa_id) references materia (id);
alter table correlativas add constraint FKm79dfxp7nbsfxsj55ibkeqgah foreign key (materia_id) references materia (id);
alter table examen add constraint FK6or2j45fp57sdkv23hvmj3a63 foreign key (comision_id) references comision_materia (id);
alter table horario_modulos add constraint FKgekofxr7032hrlbbg5q2itggu foreign key (modulo_id) references modulo_horario (id);
alter table horario_modulos add constraint FK7fr7blf8itlt9th3brcybjtw0 foreign key (horario_id) references horario_clase (id);
alter table horario_clase add constraint FKcwyqu53351lxb5ie0upqtcfe5 foreign key (comision_id) references comision_materia (id);
alter table materia add constraint FKeknyj1f0dvp1dp6uyvux8e4nc foreign key (plan_estudio_id) references plan_estudio (id);
alter table nota add constraint FK216faqwon6hfnfh0b3e7x6kl3 foreign key (examen_id) references examen (id);
alter table nota add constraint FK953xv6clpjg17vme3hv9gu63t foreign key (alumno_inscripto_id) references alumno_inscripto (id);
alter table plan_estudio add constraint FKiv07nlvdww903m6plqscuoeq4 foreign key (carrera_id) references carrera (id);
alter table profesor add constraint FKbet8xl9buvpc6re219jnob1xi foreign key (user_id) references usuarios (id);
alter table user_roles add constraint FK2chxp26bnpqjibydrikgq4t9e foreign key (user_id) references usuarios (id);
