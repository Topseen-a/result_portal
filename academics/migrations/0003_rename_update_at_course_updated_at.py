from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('academics', '0002_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='course',
            old_name='update_at',
            new_name='updated_at',
        ),
        migrations.AlterField(
            model_name='course',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
    ]